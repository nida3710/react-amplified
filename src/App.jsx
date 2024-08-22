import { useEffect, useState } from "react";

import { generateClient } from "aws-amplify/api";

import { createTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";

const initialState = {
  name: "",
  description: "",
  dueDate: "",
  completed: false,
};
const client = generateClient();

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos,
      });
      let todos = todoData.data.listTodos.items;
      console.log(todos);
      // todos = todos
      //   .filter((todo) => !todo.completed)
      //   .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1)); // 期限日でソート (新しい順)
      setTodos(todos);
    } catch (err) {
      console.log("error fetching todos");
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await client.graphql({
        query: createTodo,
        variables: {
          input: todo,
        },
      });
      fetchTodos(); // 新しいToDoを追加した後にリストを再取得
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  const toggleComplete = async (todo) => {
    try {
      const updatedTodo = { ...todo, completed: !todo.completed };
      await client.graphql({
        query: updateTodo,
        variables: {
          input: updatedTodo,
        },
      });
      fetchTodos(); // 状態を更新した後にリストを再取得
    } catch (err) {
      console.log("error updating todo:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>TODOアプリ</h2>
      <input
        onChange={(event) => setInput("name", event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="TODO名"
      />
      <input
        onChange={(event) => setInput("description", event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="説明"
      />
      <input
        onChange={(event) => setInput("dueDate", event.target.value)} // 新しく期限日を入力するフィールド
        style={styles.input}
        value={formState.dueDate}
        placeholder="期限日 (YYYY-MM-DD)"
        type="date"
      />
      <button style={styles.button} onClick={addTodo}>
        作成
      </button>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>完了</th>
            <th>TODO名</th>
            <th>説明</th>
            <th>期限日</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo, index) => (
            <tr key={todo.id ? todo.id : index}>
              <td>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo)}
                />
              </td>
              <td>{todo.name}</td>
              <td>{todo.description}</td>
              <td>{todo.dueDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.todo}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleComplete(todo)}
          />
          <p style={styles.todoName}>{todo.name}</p>
          <p style={styles.todoDescription}>{todo.description}</p>
          <p style={styles.todoDueDate}>{todo.dueDate}</p
        </div>
      ))} */}
    </div>
  );
};

const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  todoDueDate: { fontSize: 16, color: "gray" }, // 期限日のスタイル
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
  },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 20 },
  th: {
    textAlign: "center",
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderBottom: "1px solid #ddd",
  },
  td: { textAlign: "center", padding: 10, borderBottom: "1px solid #ddd" },
};

export default App;
