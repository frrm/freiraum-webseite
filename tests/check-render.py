from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('a', 'img'):
            self.urls.append(attrs.get('href') if tag == 'a' else attrs.get('src'))

for page in ('index.html', 'post/example/index.html'):
    parser = Links()
    parser.feed((Path('/tmp/render-check') / page).read_text())
    base = 'https://example.test/' + page.removesuffix('index.html')
    urls = [urljoin(base, url) for url in parser.urls if url]
    for expected in ('/post/example/child', '/post/example/#section',
                     '/post/example/?view=full', 'https://example.com/',
                     'mailto:test@example.org', '/post/example/picture.png'):
        assert urljoin("https://example.test/", expected) in urls, (page, expected, urls)

class LanguageLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.links.append(dict(attrs))

english = LanguageLinks()
english.feed((Path('/tmp/render-check') / 'en/post/example/index.html').read_text())
base = 'https://example.test/en/post/example/'
links = {urljoin(base, link['href']): link for link in english.links if 'href' in link}
assert links['https://example.test/en/post/example/'].get('hreflang') != 'de'
assert links['https://example.test/post/untranslated/'].get('hreflang') == 'de'
