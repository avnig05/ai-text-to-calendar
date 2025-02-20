from fastapi import FastAPI, File, UploadFile
import shutil
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from event_generation.nlp_parsers.text_parser import TextToEventParser
from event_generation.nlp_parsers.image_parser import ImageToTextParser
# from event_generation.event.event import Event


class CalendarRequest(BaseModel):
    event_body: str
    platform: str


app = FastAPI()
UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)

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
    event_list = parser.parse_text(item.event_body)

    for event in event_list:
        print(event)
    return event_list


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    file_path = UPLOAD_FOLDER / file.filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # return {"file name": file.filename}
    parser = ImageToTextParser()
    res = " ".join(parser.parse_image(file_path))

    parser = TextToEventParser()
    event = parser.parse_text(res)

    try:
        file_path.unlink()
    except Exception as e:
        print("ERROR: could not remove file: ", e)

    print(event)
    return event