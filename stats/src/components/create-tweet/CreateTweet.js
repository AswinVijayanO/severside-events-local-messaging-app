import React, { useState } from 'react';
function CreateTweet(props) {
    const BACKURL = "http://192.168.1.11:5000"
    const [file, setFile] = useState(null);
    function tweetUp(event) {
        event.preventDefault();
        if (event.target.form[0].value === null || event.target.form[0].value.match(/^ *$/) !== null) {
            return;
        }

        const body = JSON.stringify({
            image: file,
            text: event.target.form[0].value,
            time: Date.now(),
            token: props.token,
            likedBy: []
        });
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        };
        fetch('/postTweet', requestOptions).then(response => response.json())
            .then(data => console.log(data));
        event.target.form[0].value = "";
        setFile(null)
    }
    function onChangeHandler(event) {
        const fd = new FormData();
        fd.append('image', event.target.files[0]);
        const requestOptions = {
            method: 'POST',
            body: fd
        };
        fetch('/upload', requestOptions).then(response => response.json())
            .then(data => setFile(data.files.image.path.replace("public",BACKURL)));
        //setFile(event.target.files[0])
    }
    return (
        <div className="flex-row">

            <form>
                <div className="form-group">
                    <textarea className="form-control circular-font" id="exampleFormControlTextarea1" rows="3" placeholder="Say.."></textarea>

                    {
                        file ?
                            <div className="flex-column">
                                <img className="postImage" src={file} alt="" />
                                <button type="button" className="btn delete-btn circular-font" onClick={() => setFile(null)}>remove pic</button>
                            </div>

                            :
                            <div>
                                <div class="custom-file">
                                    <input type="file" class="custom-file-input   fileupload" name="file" onChange={onChangeHandler} />
                                    <p className="upload-text circular-font">Post image</p>
                                </div>
                            </div>

                    }
                    <button type="button" className="btn light-btn circular-font" onClick={tweetUp}>tweet</button>

                </div>
            </form>
        </div >


    );
}
export default CreateTweet;