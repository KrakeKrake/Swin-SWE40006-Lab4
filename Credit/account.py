import os
from datetime import datetime, timezone, timedelta
import argon2
import jwt
from argon2.exceptions import VerifyMismatchError
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

DB_URL = "sqlite:///./users.sqlite3"
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
hasher = argon2.PasswordHasher()


class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    description = Column(String)
    dob = Column(DateTime)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


## Pydantic schema


class AccountCreate(BaseModel):
    name: str
    email: str
    password: str
    description: str
    dob: datetime


class AccountResponse(BaseModel):
    id: int
    name: str
    email: str
    description: str
    dob: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    id: int


## JWT stuff


SECRET_KEY = os.environ["JWT_SECRET"]
ALGORITHM = os.environ["JWT_ALGORITHM"]
TOKEN_EXPIRATION: int = int(os.environ["JWT_EXPIRATION"])


# JWT Explained: https://www.geeksforgeeks.org/web-tech/json-web-token-jwt/
def create_jwt(ident: int) -> str:
    payload = {
        "sub": str(ident),  # Subject (so the user(
        "iat": datetime.now(timezone.utc),  # Issuing time
        "exp": datetime.now(timezone.utc) + timedelta(hours=int(TOKEN_EXPIRATION)),  # Expiry time
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)  # Encoded into base64 hs265


def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)) -> Account:
    if not authorization.startswith("Bearer "):  # Ok not sure why it needs to start with Bearer
        raise HTTPException(status_code=401, detail="Invalid Authorization Header")
    token = authorization.removeprefix("Bearer ")  # And then remove it? IDK why
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])  # Decode with JWT, with what it encrypted with
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Signature has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(Account).filter(Account.id == int(payload["sub"])).first()  # Look for the subject in the db
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


## Fast API


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/account", response_model=AccountResponse, status_code=201)
async def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    existing_account = db.query(Account).filter(Account.email == account.email).first()
    if existing_account:
        raise HTTPException(status_code=409, detail="Account already exists")

    hashed = hasher.hash(account.password)
    new_account = Account(
        name=account.name,
        email=account.email,
        password_hash=hashed,
        description=account.description,
        dob=account.dob,
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return new_account


@app.get("/account/{account_id}", response_model=AccountResponse)
async def get_account(account_id: int,
                      current_user: Account = Depends(get_current_user)):
    if current_user.id != account_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return current_user


@app.post("/login", response_model=LoginResponse)
async def login(account: LoginRequest, db: Session = Depends(get_db)):
    db_account = db.query(Account).filter(Account.email == account.email).first()
    if db_account is None:
        raise HTTPException(status_code=401, detail="Invalid credentiels")

    try:
        hasher.verify(db_account.password_hash, account.password)
    except VerifyMismatchError:
        raise HTTPException(status_code=401, detail="Invalip credentials")

    token = create_jwt(db_account.id)
    return LoginResponse(token=token, id=db_account.id)


@app.delete("/account/{account_id}", status_code=204)
async def delete_account(account_id: int,
                         db: Session = Depends(get_db),
                         current_user: Account = Depends(get_current_user)):
    if current_user.id != account_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.delete(current_user)
    db.commit()
    return None

# Just for testing
class AccountsResponse(BaseModel):
    accounts: list[AccountResponse]
@app.get("/evil-hacker-endpoint", response_model=AccountsResponse)
async def get_evil_hacker_endpoint(db: Session = Depends(get_db)):
    db_accounts = db.query(Account).all()
    return AccountsResponse(accounts = db_accounts)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
