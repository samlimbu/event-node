const mongoose = require('mongoose');

const LocationsSchema = new mongoose.Schema({
    location: String
});
const Location = mongoose.model("Location", LocationsSchema);

module.exports = {
    Location: Location,

};