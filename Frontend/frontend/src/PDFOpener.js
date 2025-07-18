import React, { useRef, useState } from 'react';

import { Modal, Spinner } from 'react-bootstrap'

import axios from 'axios'

import Button from 'react-bootstrap/Button';

import * as pdfjsLib from 'pdfjs-dist/build/pdf';

import bg from './bg2.png';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


function PDFPageViewer({ pageTexts, offset }) {
    const pageDivs = [];

    const limit = 10;
    const end = Math.min(offset + limit, pageTexts.length);

    for (let i = offset; i < end; i++) {
        pageDivs.push(
            <div key={i} style={{ padding: "1em", borderBottom: "1px solid #ccc", border:'1px solid black', background: 'white', marginTop:5, marginBottom:5, marginLeft:200, marginRight:200 }}>
                <h4>Page {i + 1}</h4>
                <pre style={{ whiteSpace: "pre-wrap" }}>{pageTexts[i]}</pre>
            </div>
        );
    }

    return <div>{pageDivs}</div>;
}


function PDFOpener() {
    const fileInputRef = useRef(null);

    const [text, setText] = useState([]);
    const [pdfloaded, setpdfloaded] = useState(false);

    const [pageoffset, setpageoffset] = useState(0);

    const [maxpages, setmaxpages] = useState([]);

    const maxpagecount = 10;


    const [selectedWord, setSelectedWord] = useState('');
    const [definition, setDefinition] = useState('');



    const [show, setShow] = useState(false);
    const [serverData, setServerData] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setShow(false);
        setServerData('');
        window.getSelection().removeAllRanges();
    };


    const handleMouseUp = () => {
        const selection = window.getSelection().toString();
        if (selection) {
            setLoading(true);
            setDefinition('');
            setShow(true);
            setSelectedWord(selection);
            axios.get('http://localhost:5000/api/search', { params: { texts: selection } })
                .then(res => {
                    setDefinition(res.data);
                    window.getSelection().removeAllRanges();
                    setLoading(false);
                })
                .catch(err => console.error(err));
        }
    };

    const handlenext = () => {
        setpageoffset(pageoffset + maxpagecount);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleButtonClick = () => {
        fileInputRef.current.click(); // Trigger the hidden input
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (!file || file.type !== "application/pdf") return;

        setpdfloaded(true);

        const pages = []
        const fileReader = new FileReader();
        fileReader.onload = async () => {
            const typedArray = new Uint8Array(fileReader.result);
            const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                const strings = content.items.map(item => item.str);
                const pagetext = strings.join(" ") + "\n\n";
                const cleanText = pagetext.replace(/\r\n/g, '\n').replace(/\s{2,}/g, ' ');
                pages.push(cleanText);
            }

            setText(pages);
        }

        fileReader.readAsArrayBuffer(file);
    };



    const loadmaxpages = () => {
        const pagelen = text.length

        let pages = []

        for (let i = pageoffset; i < pageoffset + maxpagecount; i++) {
            pages.push(text[i]);
        }

        setmaxpages(pages);
    }

    return (
        <div style={{flex: 1, display:'flex', flexDirection: 'column', justifyContent:'center', background:`url(${bg})`, backgroundSize:'cover', backgroundRepeat:'no-repeat'}}>
            {!pdfloaded ? (
                <div>
                    <Button onClick={handleButtonClick} variant='primary' style={{padding: 20, opacity: 2.0}}>Select PDF</Button>
                    <input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div >
            ) : (
                <div onMouseUp={handleMouseUp}>
                    <Modal show={show} onHide={handleClose} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedWord}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {loading ? (
                                <div className="text-center">
                                    <Spinner animation="border" />
                                    <p className="mt-2">Loading...</p>
                                    {definition}
                                </div>
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: definition }} />
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <PDFPageViewer pageTexts={text} offset={pageoffset}></PDFPageViewer>
                    <Button variant='primary' onClick={handlenext}>Next</Button>
                </div>
            )
            }
        </div >
    );
}

export default PDFOpener;
