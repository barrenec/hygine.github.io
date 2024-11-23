from bs4 import BeautifulSoup
from dotenv import load_dotenv
import json
from openai import OpenAI
import os
import requests
import time
import re

load_dotenv()

def add_paragraphs(text, method='sentences', sentences_per_para=3):
   if method == 'sentences':
       sentences = re.split(r'(?<=\.)\s+', text)

       paragraphs = []
       current_para = []

       for i, sentence in enumerate(sentences, 1):
           current_para.append(sentence)
           if i % sentences_per_para == 0:
               paragraphs.append(' '.join(current_para))
               current_para = []

       if current_para:
           paragraphs.append(' '.join(current_para))

       return '\n\n'.join(paragraphs)

   elif method == 'semicolon':
       return text.replace('; ', '.\n\n')

def scrape_and_save():
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
               "content_latin": add_paragraphs(paragraphs[i+1].text.strip(), method='sentences', sentences_per_para=2),
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
               model="gpt-4",
           )

           entry['content_german'] = add_paragraphs(response.choices[0].message.content,
                                                  method='sentences',
                                                  sentences_per_para=2)
           time.sleep(1)

       except Exception as e:
           print(f"Error translating {entry['title']}: {e}")

   sorted_data = sorted(data, key=lambda x: x['title'])

   with open('hyginus_translated.json', 'w', encoding='utf-8') as f:
       json.dump(sorted_data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
   scrape_and_save()
   translate_entries()
