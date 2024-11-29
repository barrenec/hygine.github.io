import markdown2
import sys
import os

def convert_markdown_to_html(input_file):
    # Überprüfen, ob die Datei existiert
    if not os.path.exists(input_file):
        print(f"Fehler: Datei {input_file} nicht gefunden.")
        return

    # Überprüfen, ob es sich um eine Markdown-Datei handelt
    if not input_file.lower().endswith(('.md', '.markdown')):
        print("Fehler: Die Eingabedatei muss eine Markdown-Datei sein (.md oder .markdown).")
        return

    # Generieren des Ausgabedateinamens
    output_file = os.path.splitext(input_file)[0] + '.html'

    # Lesen der Markdown-Datei
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            text = f.read()
    except Exception as e:
        print(f"Fehler beim Lesen der Datei: {e}")
        return

    # Konvertieren zu HTML mit markdown2
    try:
        html = markdown2.markdown(text)
    except Exception as e:
        print(f"Fehler bei der Konvertierung von Markdown zu HTML: {e}")
        return

    # Hinzufügen von einfachem CSS
    css = ""

    # Erstellen des vollständigen HTML-Dokuments
    complete_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{os.path.splitext(os.path.basename(input_file))[0].title()}</title>
    {css}
</head>
<body class="modal-body">
    {html}
</body>
</html>"""

    # Schreiben in die Ausgabedatei
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(complete_html)
        print(f"Erfolgreich konvertiert: {input_file} zu {output_file}")
    except Exception as e:
        print(f"Fehler beim Schreiben der Datei: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Verwendung: python script.py input.md")
    else:
        convert_markdown_to_html(sys.argv[1])
