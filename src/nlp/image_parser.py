import os
from openai import OpenAI
from typing import Optional
from dotenv import load_dotenv
import base64
import json


# private Helper function to encode the image
# https://platform.openai.com/docs/guides/vision#uploading-base64-encoded-images
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

class ImageToTextParser:
    def __init__(self):
        # Load the .env file
        load_dotenv(dotenv_path='./src/config/.env')

        # Get the API key
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("API key not found. Make sure you have a .env file with OPENAI_API_KEY set.")
        
        # Initialize OpenAI client with API key
        self.client = OpenAI(api_key=api_key)

    def parse_image(self, image_path: str):
        """
        Parse an image and extract text content using OpenAI's Vision API.
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            str list: list of Extracted text content from the image, or empty list if parsing fails
        """
        try:

            # Getting the Base64 string
            base64_image = encode_image(image_path)
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """extract all the text from the image, this text will be used to create a calendar event
                                        At the very minimum get a title and a date and time from the image, you will return these as 1 string without any new lines
                                        into a json object with the field name "text" and the value being the extracted text
                                        if there appear to be mutiple different events in the image, return each description one as a separate field in the JSON object,
                                        if there appears to be an event with a sub event, return the sub event as a separate event, but include all the information that was relevant from its paerent
                                        do your best to include every peice of text in the image even if it doesnt seem relevent, if you are unsure about a peice of text
                                        make your best interpretation and, include it in the JSON object
                                        for example The final output should be a clean JSON like:
                                        {
                                        "events": [
                                            {"parsed_event": "all the text from the image relating to the first event"},
                                            {"parsed_event": "all the text from the image relating to the second event"}
                                        ]
                                        }
                                        """,
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                            },
                        ],
                    }
                ],
                response_format={'type': "json_object"}
            )

                
            # Extract the response text
            extracted_text = response.choices[0].message.content
            
            # Parse the JSON string into a list
            extracted_text_prompts = []
            parsed_json = json.loads(extracted_text)
            for event in parsed_json["events"]:
                extracted_text_prompts.append(event["parsed_event"])

            return extracted_text_prompts

        except Exception as e:
            print(f"Error parsing image: {str(e)}")
            return None