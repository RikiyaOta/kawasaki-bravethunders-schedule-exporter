# kawasaki-bravethunders-schedule-exporter 

This software is released under the MIT License, see LICENSE.txt.

川崎ブレイブサンダースの試合日程を[公式HP](https://kawasaki-bravethunders.com/)から取得し、GoogleCalendarにインポートできる形のCSVを出力するツール。

# 注意

非公式ツールです。ただのいち川崎ファミリーが趣味で作りました。
ご了承ください。

# CSV ファイルの取り込み

Google Calendar の[こちらのページ](https://support.google.com/calendar/answer/37118)を参照して、CSVファイルから予定をインポートすることができます。

# 使い方

- 前提:
    - このリポジトリをクローンする。
    - Node.js をインストールする（細かく試していませんが、18とかじゃないと動かないと思います. 僕は v20.6.1 で動かしました.）

```
$ npm ci

$ npm run gen-for-google 2023-10 2024-05
```

- 補足:
    - `npm run gen-for-google`の引数は、カレンダーに登録したいスケジュールの月の範囲を指定するものです。
    - 月を1つだけ指定することも可能です。その場合は、その月だけのCSVを出力します。
    - `dist/`ディレクトリにCSVファイルが出力されます。
