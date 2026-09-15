const path = require('path');
const fs = require('fs');

const officersData = require('../../data/officers.json');
const contractorsData = require('../../data/contractors.json');

const getOfficers = (req, res) => {
  const { ward, department } = req.query;
  let filtered = officersData;
  
  if (ward) filtered = filtered.filter(o => o.jurisdiction.ward === ward);
  if (department) filtered = filtered.filter(o => o.departmentId === department);
  
  return res.json({ success: true, data: filtered });
};

const getContractors = (req, res) => {
  const { ward, department } = req.query;
  let filtered = contractorsData;
  
  if (ward) filtered = filtered.filter(c => c.assignedWards.includes(ward));
  if (department) filtered = filtered.filter(c => c.departmentId === department);
  
  return res.json({ success: true, data: filtered });
};

module.exports = { getOfficers, getContractors };
