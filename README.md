# AI Calendar Event Generator

Tool that turns plain text or images into calendar events for easy importing to Google Calendar or any other calendar

## How to run the calendar converter as a CLI

Make sure you pip install all the requirements located in `./requirements.txt` (currently might be issues)

copy/change `./src/event_generation/config/.env.example` to `./src/event_generation/config/.env` and replace the placeholder with your OpenAI API key

for easy testing you can run the CLI script by CD'ing into `./ai-text-to-calendar/src/` and running `python -m event_generation.testing.test_to_cal_cli`

- pass in a path to an image e.g: `./src/event_generation/testing/single_event.png` in which case `image_parser.py` will be called to scrape the image into a text prompt before calling `text_parser.py`

- or you can directly type your event prompt in which case just `text_parser.py` will be called and will output a `Event` object with the relevant details and links

you can also edit `test_to_cal_cli.py` and change the **genIcal** flag to true, so it outputs a file in .ical format

## How to start the backend server

Assuming all the required packages are installed (located in requirements.txt), navigate into `./ai-text-to-calendar/src` folder of the project and run the folowing command in the terminal:

`uvicorn main:app --reload`

to test the route `/add-to-calendar` without starting the front end server, enter the following into your terminal:

```bash
curl -X POST http://127.0.0.1:8000/add-to-calendar \
     -H "Content-Type: application/json" \
     -d '{"event_body":"meeting for slug ai at 7:00 pm thursday jan 30th, attendees will be Anurag and Bob","platform":"google calendar"}'
```

The output should have all the parsed information, including the link, as an object!

## How to start the frontend server

make sure you have npm installed
run `npm install` and `npm install next`

To start up the frontend server navigate into `./ai-text-to-calendar/frontend/text-to-calendar/`
and run:

`npm run dev`

now you should be able to navigate to `http://localhost:3000/` in your web browser to interact with the converter

## Future Improvements

- connect to google login for automatic import
- allow image input
