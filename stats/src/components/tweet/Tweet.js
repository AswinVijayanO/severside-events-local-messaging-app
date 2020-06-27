import React from 'react';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

function Tweet(props) {
  TimeAgo.addLocale(en)
  const timeAgo = new TimeAgo('en-US');
  const self = props.tweet.token === props.me ? " self" : "";
  function like(event) {
    const tweetId = props.tweet.postId;
    event.preventDefault();
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

    };
    fetch('/likeTweet?postId=' + tweetId + '&userId=' + props.me, requestOptions).then(response => response.json())
      .then(data => console.log(data));
  }
  return (
    <div className="tweet">
      <div className={self}>
        <div className={" card circular-font"} style={{ "width": "fit-content", "maxWidth": "600px", "minWidth": "400px" }}>
          <div className="card-body circular-font">
            <p className="you">->You:</p>
            <h6 className="card-subtitle mb-2 username circular-font">{"@" + props.tweet.username}</h6>
            <p className="subtext circular-font">{timeAgo.format(new Date(props.tweet.time))}</p>
            <p className="card-text circular-font">{props.tweet.text}</p>
            <img className="postImage" src={props.tweet.image} alt={props.tweet.image} />
            <p className="subtext circular-font" onClick={like}>{props.tweet.likes + " Likes"}</p>
          </div>
        </div>
      </div>
    </div>



  )
}
export default Tweet;