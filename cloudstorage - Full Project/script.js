// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC3MIN64hy_oTQfQWUHl0lID-CJkIfci0M",
    authDomain: "yt-project-a29f8.firebaseapp.com",
    projectId: "yt-project-a29f8",
    storageBucket: "yt-project-a29f8.appspot.com",
    messagingSenderId: "159898773748",
    appId: "1:159898773748:web:2985334de4f06ff73356a1",
    measurementId: "G-DLWR9M5SJC"
  };
firebase.initializeApp(firebaseConfig);
// get dom in variables
var upload = document.getElementsByClassName('upload')[0];
var hiddenBtn = document.getElementsByClassName('hidden-upload-btn')[0];
var progress = document.getElementsByClassName('progress')[0];
var percent = document.getElementsByClassName('percent')[0];
var pause = document.getElementsByClassName('pause')[0];
var resume = document.getElementsByClassName('resume')[0];
var cancel = document.getElementsByClassName('cancel')[0];

// create function for select a file
upload.onclick = function () {
    hiddenBtn.click();
}

// also store files path in localstorage or in database for further use
if(!localStorage.getItem("uploaded-metadata")){
    var metadata = '[]';
    localStorage.setItem('uploaded-metadata', metadata)
}

// get selected file and upload function
hiddenBtn.onchange = function () {
    // get file
    var file = hiddenBtn.files[0];
    // change file name so cannot overwrite
    var name = file.name.split('.').shift() + Math.floor(Math.random() * 10) + 10 + '.' + file.name.split('.').pop();
    var type = file.type.split('/')[0];
    var path = type + '/' + name;
    // now upload
    var storageRef = firebase.storage().ref(path);
    var uploadTask = storageRef.put(file);

    pause.onclick = function () {
        uploadTask.pause();
        resume.style.display = 'inline-block';
        pause.style.display = 'none';
    }
    resume.onclick = function () {
        uploadTask.resume();
        resume.style.display = 'none';
        pause.style.display = 'inline-block';
    }
    cancel.onclick = function () {
        uploadTask.cancel();
        progress.style.width = '0%';
        percent.innerHTML = '0%';
    }

    upload.disabled = true;
    percent.innerHTML = '0%';

    // get progressbar
    uploadTask.on('state_changed',
        (snapshot) => {
            var progressValue = String((snapshot.bytesTransferred / snapshot.totalBytes) * 100).split('.')[0];
            progress.style.width = progressValue + '%';
            percent.innerHTML = progressValue + '%';
        },
        (error) => {
            console.log(error)
        },
        () => {
            // on successful upload
            var metadata = JSON.parse(localStorage.getItem('uploaded-metadata'));
            metadata.unshift(path);
            localStorage.setItem("uploaded-metadata", JSON.stringify(metadata));
            percent.innerHTML = 'DONE';
            upload.disabled = false;
            hiddenBtn.value = null;
            // also refresh list on new upload
            showFilesList();
        }
    )
}

var expandContainer = document.getElementsByClassName('expand-container')[0];
var expandContainerUl = document.querySelector('.expand-container ul');
var loader = document.getElementsByClassName('loader')[0];

window.onload = showFilesList;
// make a function to show all files list
function showFilesList(){
    // get data from localstorage
    var data = JSON.parse(localStorage.getItem('uploaded-metadata'));
    // refresh all files on function reload
    document.getElementById('video').innerHTML = '';
    document.getElementById('audio').innerHTML = '';
    document.getElementById('image').innerHTML = '';
    for(var i = 0; i < data.length; i++){
        var folder_name = data[i].split('/')[0];
        var file_name = data[i].split('/')[1];
        var path = data[i];
        if(folder_name == 'video'){
            document.getElementById('video').innerHTML += `
            <li data-name="${path}">
                <span>${file_name}</span>
                <svg onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
            </li>
            `;
        }else if(folder_name == 'audio'){
            document.getElementById('audio').innerHTML += `
            <li data-name="${path}">
                <span>${file_name}</span>
                <svg onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
            </li>
            `;
        }else{
            document.getElementById('image').innerHTML += `
            <li data-name="${path}">
                <span>${file_name}</span>
                <svg onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
            </li>
            `;
        }
    }
}

// now make expand function to open more info
function expand(v){
    var path = v.parentElement.getAttribute('data-name');
    var click_position = v.getBoundingClientRect();
    if(expandContainer.getAttribute('data-value') == '0'){
        expandContainer.style.display = 'block';
        expandContainerUl.style.display = 'block';
        loader.style.display = 'none';
        expandContainer.style.left = (click_position.left + window.scrollX)-85 + 'px';
        expandContainer.style.top = (click_position.top + window.scrollY)+25 + 'px';
        expandContainer.setAttribute('data-value', '1');
        expandContainerUl.setAttribute('data-file-name', path);
        v.setAttribute('id', 'temp-id');
        v.setAttribute('onclick', '');
    }
}

// now run shrink() function anywhere click
document.addEventListener('mouseup', function(v){
    if(!expandContainer.contains(v.target)){
        shrink();
    }
});

// hide that container
function shrink(){
    expandContainer.style.display = 'none';
    expandContainer.setAttribute('data-value', '0');
    setTimeout(function(){
        try{
            var temp_id = document.getElementById('temp-id');
            temp_id.setAttribute('onclick', 'expand(this)');
            temp_id.setAttribute('id', '')
        }catch{}
    }, 100);
}

// now open file
function openFile(v){
    var path = v.parentElement.getAttribute('data-file-name');
    var storageRef = firebase.storage().ref(path);
    expandContainerUl.style.display = 'none';
    loader.style.display = 'block';
    storageRef.getDownloadURL()
    .then((url) => {
        var a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.click();
        shrink();
    })
    .catch((error) => {
        // if any error
        console.log(error);
    })
}

// now download file
function downloadFile(v){
    var path = v.parentElement.getAttribute('data-file-name');
    var storageRef = firebase.storage().ref(path);
    expandContainerUl.style.display = 'none';
    loader.style.display = 'block';
    storageRef.getDownloadURL()
    .then((url) => {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function(){
            var blob = xhr.response;
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.download = path.split('/')[1];
            a.click();
        };
        // get progress
        xhr.addEventListener('progress', function(event){
            var progressValue = String((event.loaded / event.total) * 100).split('.')[0];
            progress.style.width = progressValue + '%';
            percent.innerHTML = progressValue + '%';
        })
        xhr.open('GET', url);
        xhr.send();
        document.documentElement.scrollTop = 0;
        shrink();
    })
    .catch((error) => {
        // if any error
        console.log(error);
    })
}

// now delete file
function deleteFile(v){
    var path = v.parentElement.getAttribute('data-file-name');
    var storageRef = firebase.storage().ref(path);
    // get data from localstorage
    var metadata = JSON.parse(localStorage.getItem('uploaded-metadata'));
    var index = metadata.indexOf(path);
    expandContainerUl.style.display = 'none';
    loader.style.display = 'block';
    storageRef.delete().then(() => {
        if(index > -1){
            // remove the path index and again save in localstorage
            metadata.splice(index, 1);
            localStorage.setItem('uploaded-metadata', JSON.stringify(metadata));
        }
        // show new list after remove
        showFilesList();
        shrink();
    }).catch((error) => {
        console.log(error);
    })
}