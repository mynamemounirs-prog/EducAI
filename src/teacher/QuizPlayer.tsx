import {useState} from 'react';
import {CheckCircle,RotateCcw} from 'lucide-react';
import {type Question,validQuestion} from './model';
export function QuizPlayer({questions,game=false}:{questions:Question[];game?:boolean}){
 const [answers,setAnswers]=useState<Record<string,string>>({});const [corrected,setCorrected]=useState(false);const [index,setIndex]=useState(0);
 const valid=questions.length>0&&questions.every(validQuestion);const compatible=questions.every(q=>q.type!=='open');
 if(!valid)return <p className="teacher-notice">Renseignez les questions, les choix et les réponses correctes avant l’aperçu.</p>;
 if(game&&!compatible)return <p className="teacher-notice">Le jeu accepte les QCM et les questions vrai/faux. Les réponses ouvertes restent disponibles dans l’aperçu, avec un corrigé indicatif.</p>;
 const closed=questions.filter(q=>q.type!=='open');const score=closed.filter(q=>answers[q.id]===q.answer).length;const complete=game&&index>=questions.length;
 function restart(){setAnswers({});setCorrected(false);setIndex(0)}
 if(complete)return <div className="game-finish"><CheckCircle size={38}/><h3>Partie terminée !</h3><p>Score : {score} / {closed.length}</p><button className="primary" onClick={restart}><RotateCcw size={16}/> Rejouer</button></div>;
 const visible=game?[questions[index]]:questions;
 return <section className="quiz-player">{game&&<><div className="game-progress"><span>Question {index+1} / {questions.length}</span><span>Score : {score}</span></div><progress value={index} max={questions.length}/></>}
 {visible.map((q,i)=>{const show=game?answers[q.id]!==undefined:corrected;return <fieldset className="quiz-question" key={q.id}><legend>{game?index+1:i+1}. {q.prompt}</legend>{q.type==='open'?<textarea aria-label={`Votre réponse à la question ${i+1}`} value={answers[q.id]||''} disabled={show} onChange={e=>setAnswers({...answers,[q.id]:e.target.value})}/>:q.options.map(option=><label className={`quiz-answer ${show&&q.answer===option?'answer-correct':''}`} key={option}><input type="radio" name={q.id} value={option} checked={answers[q.id]===option} disabled={show} onChange={()=>setAnswers({...answers,[q.id]:option})}/>{option}</label>)}{show&&<div className="quiz-correction"><strong>{q.type==='open'?'Corrigé indicatif — sans notation automatique':answers[q.id]===q.answer?'Bonne réponse':'Réponse attendue'} : {q.answer}</strong><p>{q.explanation}</p></div>}</fieldset>})}
 {game?<button className="primary" disabled={answers[questions[index].id]===undefined} onClick={()=>setIndex(index+1)}>{index===questions.length-1?'Voir mon score':'Question suivante'}</button>:<><button className="primary" onClick={()=>setCorrected(true)}>Afficher les corrections</button>{corrected&&<p className="teacher-notice" role="status">Score des questions fermées : {score} / {closed.length}. Les réponses ouvertes ne sont pas notées automatiquement.</p>}<button className="secondary" onClick={restart}>Recommencer</button></>}
 </section>
}
