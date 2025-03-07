# Calendarize - An AI Calendar Event Generator

Calendarize is a tool designed to help you generate calendar events from images or text. It uses the OpenAI api to extract the relevant event details and then generates a calendar event for you that can be easily imported to most calendar applications.

## How to run the Calendar Event Generator

There are two bash scripts that will run the application locally you. The first script will install all the necessary dependencies and the second script will start the application.

First run the following command in the terminal to install all the necessary dependencies:

```bash
bash setup.sh
```

then run the following command to start the application on local host:

```bash
bash runlocal.sh
```

now you should be able to navigate to `http://localhost:3000/` in your web browser to interact with the converter

## How to run the calendar converter as a CLI

Make sure you install all the requirements you can do this by running `bash setup.sh` in the terminal

Alternatively you can install the requirements manually by pip installing the requirements in via the commnad: `pip install -r ./src/backend/requirements.txt`

for easy testing you can run the CLI script by CDing into `./src/backend/` and running `python -m event_generation.testing.test_to_cal_cli`

- pass in a path to an image e.g: `./src/backend/event_generation/testing/single_event.png` in which case `image_parser.py` will be called to scrape the image into a text prompt before calling `text_parser.py`

- or you can directly type your event prompt in which case just `text_parser.py` will be called and will output a `Event` object with the relevant details and links

you can also edit `test_to_cal_cli.py` and change the **genIcal** flag to true, so that it outputs a file in .ical format

## Future Improvements

- allow editing the event after generation
