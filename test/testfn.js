wait = function  (ms) {
    console.log('wait start')
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

module.exports = {wait:wait};