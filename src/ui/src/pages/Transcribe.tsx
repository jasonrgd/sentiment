import React, {ReactElement, FC, useState, useEffect} from "react";
import {Alert, Box, Button, Container, Grid, Typography, Paper, colors} from "@mui/material";
import { SharedState } from "../state/SharedState";
import MicIcon from '@mui/icons-material/Mic';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Clear from "@mui/icons-material/Clear";
import PageHeader  from "../components/PageHeader";
import { speechService } from '../services/speechService';
import { languageService } from "../services/languageService";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { Insights } from "@mui/icons-material";

interface TranscribeProps {
    sharedState: SharedState;
}

const Transcribe: FC<TranscribeProps> = ({ sharedState }): ReactElement => {
    const [localTranscript, setLocalTranscript] = useState<any[]>([]);
    const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
    const [recogniser, setRecogniser] = useState<any>(null);
    let [insights, setInsights] =  useState<any[]>([]);
    let [score, setScore] = useState<any[]>([]);
    const setupRecogniser = async () => {
        const onRecognised = (s: any, e: { result: { reason: speechsdk.ResultReason; text: React.SetStateAction<string>; }; }) => {
            console.log(e.result);
            if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {                
                console.log(`RECOGNIZED: Text=${e.result.text}`);   
                let sentiment = languageService.analyseTextAsync(e.result.text, 'analyse-sentiment');
                console.log(e.result);

                sentiment.then(function(result){
                    //console.log(result)
                    let sentences = JSON.parse(result)[0].sentences[0].text;
                    let sentiment = JSON.parse(result)[0].sentiment;
                    setScore((prevScore: any[]) => {
                        console.log(sentiment);
                        let color = "yellow";
                        if (sentiment == "positive") {
                            color = "green"
                        }
                        if (sentiment == "negative") {
                            color = "red"
                        }
                        if (sentiment == "neutral") {
                            color = "yellow"
                        }
                        return  [color, sentiment];
                    });
                    let randNum =  Math.floor(Math.random() * 10) + 1;
                    let recommendations = [
                                    "Customer's Birthday coming up soon. He loves ginger wine on his birthday",
                                    "Customer enjoys red wine during winter",
                                    "Customer is not a fan of chocolate",
                                    "Recommendation: Resend order immediately",
                                    "Offer discount of 10% on next order",
                                    "Customer loves chardonay",
                                    "Ask how customer's experience can be improved",
                                    "Ask whether last order could be resent for free",
                                    "Wife has birthday coming up soon. Ask customer whether he would also like a box of chocolates or flowers with the order",
                                    "Customer enjoyed his last order of the wine 'Chateau trapaud cuvee la chapelle grand cru saint emilion' "
                                ];
                    if (sentences.includes("damaged")) {
                        setInsights((prevTranscript: string[]) => {
                            let t = [recommendations[3]]; 
                            
                            /**
                             * ***************************************
                             * NOTE TO DEVELOPER: YOUR_MAGIC_GOES_HERE
                             * ***************************************
                             * This is where you would send the transcript to a server for processing.
                             */                                     
                            
                            return t;
                        });
                    } else {
                        setTimeout(function(){
                            setInsights((prevTranscript: string[]) => {
                                if(randNum == 3) {
                                    randNum = 1;
                                }
                                let t = [recommendations[randNum]]; 
                                
                                /**
                                 * ***************************************
                                 * NOTE TO DEVELOPER: YOUR_MAGIC_GOES_HERE
                                 * ***************************************
                                 * This is where you would send the transcript to a server for processing.
                                 */                                     
                                
                                return t;
                            });
                        }, (randNum*1000)/4);
                    }
                    
                });             
                setLocalTranscript((prevTranscript: string[]) => {
                    let t = [...prevTranscript, e.result.text]; 
                    return t;
                });
            } else if (e.result.reason === speechsdk.ResultReason.NoMatch) {
                console.log("NOMATCH: Speech could not be recognized.");
            }
        };
        const onCancelled = (s: any, e: { reason: any; }) => {
            console.log(`CANCELED: Reason=${e.reason}`);
        };
        const onSessionStarted = (s: any, e: any) => {
            console.log("\n    Session started event.");
        };
        const onSessionStopped = (s: any, e: any) => {
            console.log("Session stopped event.");
            console.log("Stop recognition.");
            recogniser.stopContinuousRecognitionAsync();
        };    

        try {
            let r = await speechService
            .initialiseRecogniserAsync(onRecognised, onCancelled, onSessionStarted, onSessionStopped);
            setRecogniser(r);
        } catch (error: any) {
            sharedState.setErrors((prev:any) => {
                return [...prev, error.message];
            });
        }
        
    }

    const beginTranscription = async () => {
        if(recogniser !== null)
        {
            try {
                sharedState.setWarnings((prev:any) => {
                    var warning = 'click the Stop button before navigating away. Thanks.';
                    return [...prev, warning];
                });
            } catch (error) {
            }

            await recogniser.startContinuousRecognitionAsync();
            setIsTranscribing(true);
        } else {
            console.log("Recogniser is null");
        }
    };

    const stopTranscription = async () => {
        if(recogniser !== null)
        {
            try {
                // RL: This is not working as expected. It is not stopping the recogniser.
                //     Use close() instead.
                //await recogniser.stopContinuousRecognitionAsync();  
                setIsTranscribing(false);
                await recogniser.close();                                          
            } catch (error) {
                console.log(error);
            } finally{                
                await setupRecogniser();  
            }
                
        }

        setIsTranscribing(false);
    };


    useEffect(() => {
        (async()=>{
            await setupRecogniser();
        })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box sx={{
            flexGrow: 1,
            backgroundColor: 'whitesmoke',
            display: 'block',            
            padding: '2rem',
        }}>
           <Container maxWidth="xl">
                <Box hidden={sharedState.errors.length < 1}>
                    {sharedState.errors.map((e: any, i: number) => {
                        return <Alert key={i} severity="error" onClose={() => sharedState.binErrors(i)}>
                            {e}
                        </Alert>
                    })}
                </Box>
                <Box hidden={sharedState.warnings.length < 1}>
                    {sharedState.warnings.map((e: any, i: number) => {
                        return <Alert key={i} severity="warning" onClose={() => sharedState.binWarnings(i)}>
                            {e}
                        </Alert>
                    })}
                </Box>
                <Grid container spacing={2} style={{marginTop:"1rem"}}>
                    <Grid item>
                        <Button onClick={beginTranscription}
                            disabled={isTranscribing}
                            variant="contained"
                            startIcon={<MicIcon />}>
                            Get Insights
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button onClick={stopTranscription}
                            // disabled={!isTranscribing}                            
                            variant="contained"
                            color="error"
                            startIcon={<RecordVoiceOverIcon />}>
                            Stop 
                        </Button>
                    </Grid>
                     <Grid item>
                        <Button onClick={()=>{
                            // check if local transcript is not empty or undefined
                            if(localTranscript !== undefined && localTranscript.length > 0)
                            {
                                setLocalTranscript([]);
                                setInsights([]);
                                setScore([]);
                            }
                        }}
                            disabled={isTranscribing}                            
                            variant="outlined"
                            color="info"
                            startIcon={<Clear />}>
                            Clear
                        </Button>
                    </Grid>
                </Grid>  
                <Grid container spacing={1} style={{marginTop:"1rem"}}>
                    <Grid item xs={8} md={10}> 
                        <Typography variant="h4">InMotion Score</Typography>
                           <div style={{ width: 250, padding:20, textAlign:"center", color:"white", fontSize: 30, backgroundColor: score[0] }}> {score[1]} </div>
                    </Grid>       
                </Grid>
                <Grid container spacing={1} style={{marginTop:"1rem"}}>
                    <Grid item xs={8} md={10}> 
                        <Typography variant="h4">Insights</Typography>
                    </Grid> 
                    <Grid item xs={12}>
                        <Paper style={{
                            padding: "1rem",
                        }}>
                            <Typography variant="body1" style={{
                                marginLeft:"0.25rem",
                                color:colors.grey[600]
                            }}>
                                {(insights.length === 0) ? "Mining Insights.." : ""}
                            </Typography>
                            {insights.map((t: string, i: number) => {
                                return (
                                    <Typography key={i} variant="body1" style={{
                                            marginLeft:"0.25rem", 
                                            marginTop: "0.25rem",
                                            fontSize: "1.25rem",
                                            color:colors.blueGrey[800]
                                        }}>
                                        <LightbulbIcon fontSize="small" style={{
                                            verticalAlign: "middle",
                                            visibility: ((t !== "") ? "visible" : "hidden"),
                                            color: colors.grey[500],
                                            fontSize: "1.55rem"
                                        }} /> {t}
                                    </Typography>
                                );
                            })}
                        </Paper>
                    </Grid>      
                </Grid>                
                <Grid container spacing={1} style={{marginTop:"1rem"}}>
                    <Grid item xs={8} md={10}> 
                    <Typography variant="h5">Transcribed speech:</Typography>
                    </Grid>
                    <Grid item xs={4} md={2} container justifyContent="flex-end">
                        <Button 
                            onClick={() => {
                                // check if local transcript is not empty or undefined
                                if(localTranscript !== undefined && localTranscript.length > 0)
                                {
                                    // join the array of strings into a single string
                                    let transcriptAsString = localTranscript.join("\n");
                                    // set the shared state transcript to the local transcript
                                    try {
                                        sharedState.setTranscript(transcriptAsString);    
                                    } catch (error) {
                                    }
                                    
                                    // copy the transcript to the clipboard
                                    navigator.clipboard.writeText(transcriptAsString);
                                }
                            }}
                            disabled={localTranscript === undefined || localTranscript.length === 0}
                            variant="outlined"
                            color="primary"
                            startIcon={<ContentCopyIcon />}>
                            Copy
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper style={{
                            padding: "1rem",
                        }}>
                            <Typography variant="body1" style={{
                                marginLeft:"0.25rem",
                                color:colors.grey[600]
                            }}>
                                {(localTranscript.length === 0) ? "No transcription yet.." : ""}
                            </Typography>
                            {localTranscript.map((t: string, i: number) => {
                                return (
                                    <Typography key={i} variant="body1" style={{
                                            marginLeft:"0.25rem", 
                                            marginTop: "0.25rem",
                                            fontSize: "1.25rem",
                                            color:colors.blueGrey[800]
                                        }}>
                                        <MicIcon fontSize="small" style={{
                                            verticalAlign: "middle",
                                            visibility: ((t !== "") ? "visible" : "hidden"),
                                            color: colors.grey[500],
                                            fontSize: "1.55rem"
                                        }} /> {t}
                                    </Typography>
                                );
                            })}
                        </Paper>                        
                        
                    </Grid>
                </Grid>             
            </Container>
        </Box>
    );
};

export default Transcribe;