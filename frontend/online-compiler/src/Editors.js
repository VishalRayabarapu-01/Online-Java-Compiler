import { Editor } from '@monaco-editor/react';
import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Output from './Output';

const Editors = (props) => {
    const socketRef = useRef(null);
    const [code, setCode] = useState(`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello !!!!");
    }
}`);
    const [output, setOutput] = useState({ current: '', prev: '' });
    const [isLoading, setIsLoading] = useState(false)
    const [isReadOnly, setIsReadOnly] = useState(true);

    useEffect(() => {
        socketRef.current = new WebSocket('ws://localhost:9091/run');

        socketRef.current.onmessage = (event) => {
            console.log(event.data);
            if (event.data === "Program successfully terminated") {
                toast("Program terminated succesfully ")
                setIsReadOnly(true)
            } else if (event.data === 'Internal error occured in program') {
                toast("Internal error occured in program :(")
                setIsReadOnly(true)
            } else {
                setOutput((prevOutput) => {
                    return { prev: prevOutput.current + event.data + "\n", current: prevOutput.current + event.data + "\n" }
                });
            }
            setIsLoading(false)
        };

        socketRef.current.onerror = (error) => {
            toast('Server error');
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    const handleRunCode = () => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            setIsLoading(true)
            setIsReadOnly(false)
            setOutput(prev => {
                return { ...prev, current: '' }
            })
            socketRef.current.send(JSON.stringify({ code }));
        } else {
            toast('Connection to server failed try later');
        }
    };

    const handleCodeChange = (value) => {
        setCode(value);
    };

    const handleOutputChange = (event) => {
        setOutput(prev => {
            return { ...prev, current: event.target.value };
        })
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            let input = findExtraString(output.current, output.prev)
            if (input !== '') {
                socketRef.current.send(JSON.stringify({ input }));
                setOutput((prevOutput) => {
                    return { ...prevOutput, prev: prevOutput.current + "\n" }
                });
            }
        }
    }

    const terminateCode=()=>{
        if(socketRef.current && socketRef.current.readyState === WebSocket.OPEN){
            socketRef.current.send(JSON.stringify({ terminate: true }));
        }
    }
    let mode = props.isDarkMode ? 'dark' : 'light';

    return (
        <div className="row p-2 px-0">
            <ToastContainer />
            <div className="col p-1">
                <div className="row d-flex">
                    <div className="col">
                        <span className={`p-4 pt-1`} style={props.isDarkMode ? {} : { background: '#edecec' }}>
                            Main.java
                        </span>
                    </div>
                    <div className="col d-flex justify-content-end mx-5 pb-1">
                        <button className={`btn btn-primary ${props.isDarkMode ? 'mb-2' : 'mb-0'}`} onClick={handleRunCode}>Run</button>
                    </div>
                </div>
                <Editor height="80vh" theme={`vs-${mode}`} defaultLanguage="java" defaultValue={code} onChange={handleCodeChange} />
            </div>
            <div className="col p-1 mx-0 px-0">
                <div className="row d-flex mx-0 px-0">
                    <div className="col">
                        <span className={`p-4 pt-1 text-${props.isDarkMode ? 'light' : 'dark'}`}>Output</span>
                    </div>
                    <div className="col d-flex justify-content-end mx-5 pb-1">
                        {!isReadOnly && <button className={`btn btn-primary mx-2 px-2 ${props.isDarkMode ? 'mb-2' : 'mb-1'}`} onClick={()=> terminateCode()}>Stop Program</button>}
                        <button className={`btn btn-primary ${props.isDarkMode ? 'mb-2' : 'mb-1'}`} onClick={() => setOutput(prev => { return { ...prev, current: '' } })}>Clear</button>
                    </div>
                </div>
                {isLoading && (
                    <div className='text-center mt-4'>
                        <img className='m-5' src={`${process.env.PUBLIC_URL}/Loading.gif`} alt="Loading" width={'70px'} height={'70px'} />
                    </div>
                )}
                {!isLoading && <Output mode={props.isDarkMode} read={isReadOnly} handleKeyDown={handleKeyDown} output={output.current} handleOutputChange={handleOutputChange} />}

            </div>
        </div>
    );
};
function findExtraString(current, prev) {
    let longer = current.length >= prev.length ? current : prev;
    let shorter = current.length < prev.length ? current : prev;
    for (let i = 0; i < longer.length; i++) {
        if (longer[i] !== shorter[i]) {
            return longer.substring(i);
        }
    }
    return longer.substring(shorter.length);
}
export default Editors;
