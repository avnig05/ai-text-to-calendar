from nlp.text_parser import TextToEventParser
from models.event import Event

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
    
def use_user_input(text):
    parser = TextToEventParser()
    print("\nEvent From User Input:")
    try:
        parsed_event = parser.parse_text(text)
        print(parsed_event)
        gcal_link = parsed_event.get_gcal_link()
        print(f"Google Calendar Link: {gcal_link}")
        print()
    except Exception as e:
        print(f"An error occurred: {e}")
        return

if __name__ == "__main__":
    # print("Running text parser tests...")
    # test_parse_text()
    # print("Tests completed.")
    while True:
        print("getting event from user input...")
        userin = input("Enter an event: ")
        if userin == "exit" or userin == "q":
            break
        use_user_input(userin)
        