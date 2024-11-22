
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import json
from openai import OpenAI
import os
import requests
import time

load_dotenv()

def scrape_and_save():
   # Scrape the text from the URL and save it to a JSON file
   # Choose the right one for your use case
   # You may need to adapt html markers to your specific case
   url = "https://an_url_where_text_is_located.com"

   response = requests.get(url)
   response.raise_for_status()

   soup = BeautifulSoup(response.text, 'html.parser')
   entries = []
   current_entry = {}

   paragraphs = soup.find_all('p')

   for i in range(len(paragraphs)-1):
       if paragraphs[i].find('b'):
           current_entry = {
               "title": paragraphs[i].find('b').text,
               "content_latin": paragraphs[i+1].text.strip(),
               "content_german": "",
               "translation_notes": ""
           }
           if paragraphs[i+2].get('class') and 'SHORTBORDER' in paragraphs[i+2].get('class'):
               entries.append(current_entry)

   with open('hyginus.json', 'w', encoding='utf-8') as f:
       json.dump(entries, f, indent=2, ensure_ascii=False)

   print("Data saved to hyginus.json")


def translate_entries():

   client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

   with open('hyginus.json', 'r', encoding='utf-8') as f:
       data = json.load(f)

   for entry in data:
       prompt = f"Translate this Latin text to German. Preserve the original meaning and style:\n\n{entry['content_latin']}"
       print("Translating:", entry['title'])
       try:

           response = client.chat.completions.create(
               messages=[
                   {
                       "role": "user",
                       "content": prompt,
                   }
               ],
               model="gpt-4o",
           )

           entry['content_german'] = response.choices[0].message.content
           time.sleep(1)  # Rate limiting



       except Exception as e:
           print(f"Error translating {entry['title']}: {e}")

   # Sort data by title
   sorted_data = sorted(data, key=lambda x: x['title'])

   with open('hyginus_translated.json', 'w', encoding='utf-8') as f:
       json.dump(sorted_data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
   scrape_and_save()
   translate_entries()


