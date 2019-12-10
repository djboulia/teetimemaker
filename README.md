# TeeTimeMaker

This app takes future tee time reservation requests, then executes an actual
tee time booking with the golf course when appropriate.  This is necessary
because the golf course tee time software opens the tee sheet at 7am 3 days
before a weekend tee time. So, for example, if you know that you want to play
on Saturday at 9am the coming week, but it's currently only Monday, you can't
make a tee time until Wednesday at 7AM.  This is inconvenient for multiple
reasons, not the least of which is a) you will forget to do this on Wednesday
and b) you may not be awake at 7am.  And, of course, if you don't get in right
at 7am, you will definitely not get a 9am tee time as those will all be
reserved by 7:01am on Wednesday.

The basic idea is this:
- accept future tee time requests for valid users arbitrarily far in the future
- when the tee sheet opens, fire an event to book it with the club
- use the user's credentials to log in and make the reservation

The UI is being built in React (see bbelow).  Still incomplete, so in the meantime, 
use the API.

The API lets you:

- create/update a user's credentials (userid and password) for the booking site
  (this is what the app uses to log in and book the tee time when the sheet opens)
- make a future reservation, specifying time, course preferences, and playing
  partners
- list the reservations you have pending
- delete or modify reservations you've made in the past
- search for other members (so you can add them as playing partners)

Behind the scenes, reservation data is stored in Cloudant.  This allows the app
to recover pending reservations if/when it is restarted.

The real heavy lifting for booking the tee time is done with a separate service
named teetimepwccjs.  This is a Javascript  REST service that interacts with
the PWCC site.

# Full Stack React & LoopBack Application

### Usage

From the root folder (teetimemaker), install the dependencies

```sh
$ npm install
```
To run the server

```sh
$ npm start
```

App:
http://localhost:3000
Loopback explorer:
http://localhost:3000/explorer

### React client_src Usage 
This is the react source code. This is the code you edit

Open a new terminal in the "client_src" folder

```sh
$ npm install -g create-react-app
```

From the "client_src folder" install client dependencies

```sh
$ npm install
```

 To Serve client

 ```sh
$ npm start
```

This should start on port 3001

### Compile React client_src

From the "client_src" folder run

 ```sh
$ npm run build
```

This will put all static assets in the Loopback "client" folder and update the main app
