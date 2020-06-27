import React, { useState, useEffect } from 'react';
import './App.css';
import CreateTweet from './components/create-tweet/CreateTweet';
import Tweet from './components/tweet/Tweet';


function App() {
  const [tweet, setTweet] = useState([]);
  const [session, setSession] = useState({ id: "unknown", name: 'unknown', loggedIn: false, loginfailed: false,room:"" });
  const [listening, setListening] = useState(false);

  function login(event) {
    event.preventDefault();
    const requestOptions = {
      method: 'GET'
    };
    const name = event.target.form[0].value;
    const room = event.target.form[1].value;
    fetch('/login?name=' + name+'&room='+room, requestOptions).then(response => response.json())
      .then(data => setSession({ id: data.token, name: data.username, loggedIn: true, loginfailed: false ,room:data.room})).catch(function () {
        setSession({ id: "unknown", name: 'unknown', loggedIn: false, loginfailed: true });
      });;

  }
  useEffect(() => {
    if (!listening && session.loggedIn) {
      const events = new EventSource('http://192.168.1.11:5000/events?room='+session.room);
      events.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);

        setTweet((tweet) => tweet.filter((twt) => twt.postId !== parsedData.postId).concat(parsedData).sort((t1, t2) => (t1.time > t2.time) ? 1 : -1));
      };
      setListening(true);
    }

  }, [listening, tweet,session]);
  return (
    <div>
      {
        session.loggedIn ?
          <div className="dimbg">
            <nav class="navbar sticky-top navbar-light bg-light flex-column">
              <div className="width-100">
                <h5 className=" circular-font">{session.name}</h5>
                <h5 className=" circular-font light-btn">{"/" + session.room}</h5>
              </div>
            </nav>
            <CreateTweet token={session.id} />
            <div className="tweetList width-100" >
              {
                (tweet.length > 0) ?
                  tweet.map((twt, i) =>
                    <div key={i}>
                      <Tweet tweet={twt} me={session.id}>
                      </Tweet>
                    </div>

                  )

                  : <div>
                    <p className="circular-font">No tweets yet.</p>
                  </div>
              }
            </div>
            {/* <nav class="navbar fixed-bottom navbar-light bg-light">
   
            </nav> */}
          </div>
          :
          <div className="login">
            {session.loginfailed ? 
            <p className="circular-font delete-btn">Username already taken</p>
            :
            <p></p>
            }

            <p className="circular-font">Loggin to post</p>
            <form className="loginform circular-font" autocomplete="off">
              <input type="text" class="form-control circular-font" id="name" placeholder="name" pattern="^[A-Za-z0-9_]{1,15}$" required></input>
              <input type="text" class="form-control circular-font" id="room" placeholder="room" pattern="^[A-Za-z0-9_]{1,15}$" required></input>
              <button type="submit" class="btn btn-primary circular-font" onClick={login}>Submit</button>
            </form>
          </div>
      }

    </div>

  );
}


export default App;