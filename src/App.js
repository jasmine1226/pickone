import React, { useState, useEffect } from "react";
import "./App.css";
import { API, Storage } from "aws-amplify";
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

  async function onChange(e) {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchQuestions();
  }

  async function fetchQuestions() {
    const apiData = await API.graphql({ query: listQuestions });
    const questionsFromAPI = apiData.data.listQuestions.items;
    setQuestions(apiData.data.listQuestions.items);
    await Promise.all(
      questionsFromAPI.map(async (question) => {
        if (question.image) {
          const image = await Storage.get(question.image);
          question.image = image;
        }
        return question;
      })
    );
    setQuestions(apiData.data.listQuestions.items);
  }

  async function createQuestion() {
    if (!formData.question) return;
    await API.graphql({
      query: createQuestionMutation,
      variables: { input: formData },
    });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
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
      <input type="file" onChange={onChange} />
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
            {question.image && (
              <img src={question.image} style={{ width: 400 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
