from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from event_generation.nlp_parsers.text_parser import TextToEventParser
# from event_generation.event.event import Event

class CalendarRequest(BaseModel):
    event_body: str
    platform: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all domains for now (change in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
async def root():
    return {"message": "hello world"}

@app.post("/add-to-calendar")
async def add_to_calendar(item: CalendarRequest):
    # return item
    parser = TextToEventParser()
    event = parser.parse_text(item.event_body)
    event.set_gcal_link()
    event.set_outlook_link()

    print(event)
    return event