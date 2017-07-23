+++
title = "{{ replace .TranslationBaseName "-" " " | title }}"
date = "{{ .Date }}"
disable_comments = false
draft = true
{{ with $.Site.Params.author }}author = "{{ . }}"{{ end }}
+++
