'use strict';

const express = require('express');

app.get('/api/clouds', (req, res)=>{
  return res.json(
    [
        {},
        {},
        {}
    ]
  );
}
);