import React, { useState, useEffect } from "react";
import "./App.css";
import { API } from "aws-amplify";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { listQuestions } from "./graphql/queries";
import {
  createQuestion as createQuestionMutation,
  deleteQuestion as deleteQuestionMutation,
} from "./graphql/mutations";

const initialFormState = { question: "", option1: "", option2: "" };

function App() {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    const apiData = await API.graphql({ query: listQuestions });
    setQuestions(apiData.data.listQuestions.items);
  }

  async function createQuestion() {
    if (!formData.question) return;
    await API.graphql({
      query: createQuestionMutation,
      variables: { input: formData },
    });
    setQuestions([...questions, formData]);
    setFormData(initialFormState);
  }

  async function deleteQuestion({ id }) {
    const newQuestionsArray = questions.filter(
      (question) => question.id !== id
    );
    setQuestions(newQuestionsArray);
    await API.graphql({
      query: deleteQuestionMutation,
      variables: { input: { id } },
    });
  }

  return (
    <div className="App">
      <h1>Pick one!</h1>
      <input
        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
        placeholder="Question"
        value={formData.question}
      />
      <input
        onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
        placeholder="option1"
        value={formData.option1}
      />
      <input
        onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
        placeholder="option2"
        value={formData.option2}
      />
      <button onClick={createQuestion}>Create Question</button>
      <div style={{ marginBottom: 30 }}>
        {questions.map((question) => (
          <div key={question.id || question.question}>
            <h2>{question.question}</h2>
            <p>{question.option1}</p>
            <p>{question.option2}</p>
            <button onClick={() => deleteQuestion(question)}>
              Delete question
            </button>
          </div>
        ))}
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
