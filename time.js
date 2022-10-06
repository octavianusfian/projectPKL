// ------------- Show Time ------------------

const time = new Date();

const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

let day = days[time.getDay()];

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

let month = months[time.getMonth()];

function addZero(i) {
    if (i < 10) {i = "0" + i}
    return i;
  }
  
let h = addZero(time.getHours());
let m = addZero(time.getMinutes());
let hours = h + ":" + m ;

const currentTime = `${hours} | ${day}, ${time.getDate()} ${month} ${time.getFullYear()}`;

export default currentTime;