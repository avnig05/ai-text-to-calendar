
# AI Calendar Event Generator

Tool that turns plain text or images into calendar events for easy importing to Google Calendar or any other calendar

## How to run this code

Make sure you pip install all the requirements located in `./requirements.txt` (currently might be issues)

copy/change `./src/config/.env.example` to `./src/config/.env` and replace the place holder with your openAi API key

You can now run `test_to_cal_cli.py`
this program takes two types of input, you can either:

- pass in a path to an image e.g: `./src/test-images/single_event.png` in which case `./src/nlp/image_parser.py` will be called before calling `./src/nlp/text_parser.py`

- or you can directly type your event prompt in which case just `./src/nlp/text_parser.py` will be called and will output an `Event` object with the relevant details and links

you can also edit `test_to_cal_cli.py` and change the **genIcal** flag to true so it outputs a file in .ical format

## Future Improvments

- connect to front end to allow for better UX
- connect to google login for automatic import
