from event_generation.nlp_parsers.text_parser import TextToEventParser
from event_generation.nlp_parsers.image_parser import ImageToTextParser
import event_generation.event.event
from pathlib import Path


def is_probable_path(s):
    path = Path(s)
    # Check if it exists or if it's syntactically a path
    return path.exists() or path.is_absolute() or any(sep in s for sep in ['/', '\\'])

def test_parse_text():
    parser = TextToEventParser()

    # Test case 1: Basic event
    
    test_text1 = "Meeting with John tomorrow at 2pm"
    print("\nTest 1:")
    print(parser.parse_text(test_text1))
    print()

    # Test case 2: More detailed event
    test_text2 = "Team lunch next Friday at 12:30pm at Downtown Cafe"
    print("\nTest 2:")
    print(parser.parse_text(test_text2))
    print()

    # Test case 3: Event with date
    test_text3 = "Dentist appointment on March 15 at 10am"
    print("\nTest 3:")
    print(parser.parse_text(test_text3))
    print()

    # Test case 4: Empty text
    test_text4 = ""
    print("\nTest 4:")
    print(parser.parse_text(test_text4))
    print()
    
def use_user_input(text, genIcal = False):
    parser = TextToEventParser()
    parsed_event = parser.parse_text(text)
    parsed_event.set_gcal_link()
    parsed_event.set_outlook_link()
    # parsed_event.set_yahoo_link()
    print(f"\n\nParsed Event:\n{parsed_event}")
    if genIcal:
        print("\nsaving event to ics file...\n")
        parsed_event.write_to_icalevent("test.ics")
        
def use_image_input(image_path, genIcal = False):
    image_parser = ImageToTextParser()
    prompt_list = image_parser.parse_image(image_path)
    for prompt in prompt_list:
            use_user_input(prompt, genIcal) 


if __name__ == "__main__":
    # print("Running text parser tests...")
    # test_parse_text()
    # print("Tests completed.")
    while True:
        print("\ngetting event from user input...")
        userin = input("Enter an event: ").lower()
        if userin == "exit" or userin == "q":
            break
        try:
            if is_probable_path(userin):
                print("Detected path, attempting to parse image...")
                use_image_input(userin, genIcal=False)
            else:
                use_user_input(userin, genIcal=False)
        except Exception as e:
            print(f"An error occurred: {e}") 