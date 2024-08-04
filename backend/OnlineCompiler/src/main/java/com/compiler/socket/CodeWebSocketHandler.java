package com.compiler.socket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class CodeWebSocketHandler extends TextWebSocketHandler {

    private Process process;
    private BufferedWriter processInputWriter;
    private Thread outputThread;
    private Thread errorThread;

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        CodeRequest codeRequest = new ObjectMapper().readValue(payload, CodeRequest.class);
        if (codeRequest.getCode() != null) {
            handleCodeExecution(session, codeRequest);
        } else if (codeRequest.getInput() != null) {
            handleProcessInput(codeRequest);
        }else if(codeRequest.getTerminate()) {
        	if(this.process !=null) {
        		process.destroy();
        		session.sendMessage(new TextMessage("Program successfully terminated"));
        	}
        }
    }

    private void handleCodeExecution(WebSocketSession session, CodeRequest codeRequest) throws IOException {
        Path codePath = Paths.get("Main.java");
        Files.write(codePath, codeRequest.getCode().getBytes());

        ProcessBuilder processBuilder = new ProcessBuilder("docker", "run", "--rm", "-i", "-v",
                codePath.toAbsolutePath().toString() + ":/Main.java", "openjdk:latest", "sh", "-c",
                "javac /Main.java && java -cp / Main");

        process = processBuilder.start();
        processInputWriter = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));

        outputThread = new Thread(() -> readProcessOutput(session, process.getInputStream()));
        outputThread.start();

        errorThread = new Thread(() -> readProcessOutput(session, process.getErrorStream()));
        errorThread.start();

        new Thread(() -> waitForProcessCompletion(session)).start();
    }

    private void handleProcessInput(CodeRequest codeRequest) {
        try {
            processInputWriter.write(codeRequest.getInput());
            processInputWriter.newLine();
            processInputWriter.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void readProcessOutput(WebSocketSession session, InputStream inputStream) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                session.sendMessage(new TextMessage(line));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void waitForProcessCompletion(WebSocketSession session) {
        try {
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                session.sendMessage(new TextMessage("Program successfully terminated"));
            } else {
                session.sendMessage(new TextMessage("Internal error occured in program"));
            }
        } catch (InterruptedException | IOException e) {
            e.printStackTrace();
        }
    }
}

class CodeRequest {
    private String code;
    private String input;
    private boolean terminate;

    public boolean getTerminate() {
		return terminate;
	}

	public void setTerminate(boolean terminate) {
		this.terminate = terminate;
	}

	public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

	@Override
	public String toString() {
		return "CodeRequest [code=" + code + ", input=" + input + ", terminate=" + terminate + "]";
	}

    
}
