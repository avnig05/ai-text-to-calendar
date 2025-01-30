from fastapi import FastAPI
from pydantic import BaseModel

class CalendarRequest(BaseModel):
    event_body: str
    platform: str

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "hello world"}

@app.post("/add-to-calendar")
async def add_to_calendar(item: CalendarRequest):
    return item