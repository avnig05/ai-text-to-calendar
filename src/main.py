from fastapi import FastAPI
from pydantic import BaseModel
from nlp.text_parser import TextToEventParser

import os 
import dotenv

class CalendarRequest(BaseModel):
    event_body: str
    platform: str

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "hello world"}

@app.post("/add-to-calendar")
async def add_to_calendar(item: CalendarRequest):
    # return item
    parser = TextToEventParser()
    event = parser.parse_text(item.event_body)
    event.set_gcal_link()

    return event