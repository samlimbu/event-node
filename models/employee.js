const mongoose = require('mongoose');
const LocationModel = require('./location');
const EmployeeSchema = new mongoose.Schema({
    employeeName: String,
    locationcolumn: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location"
        }
    ]
});

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = {
    Employee
};