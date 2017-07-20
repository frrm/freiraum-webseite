+++
title = "{{ replace .TranslationBaseName "-" " " | title }}"
date = "{{ .Date }}"
hide_authorbox = false
disable_comments = false
draft = true
{{ with $.Site.Params.author }}author = "{{ . }}"{{ end }}
+++
