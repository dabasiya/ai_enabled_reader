import logo from './logo.svg';
import './App.css';


import { Modal, Button, Spinner, Navbar, Container } from 'react-bootstrap';
import { useState } from 'react';

import PDFOpener from './PDFOpener';


function App() {

  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar bg="light">
          <Container style={{ justifyContent:'center'}}>
            <Navbar.Brand href="#home">AI Enabled Reader</Navbar.Brand>
          </Container>
        </Navbar>
        <PDFOpener></PDFOpener>
    </div>
  );
}

export default App;
