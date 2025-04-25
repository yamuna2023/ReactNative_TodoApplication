
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, StatusBar, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from 'react-native-checkbox';

const windowWidth = Dimensions.get('window').width; // Get the width of the window
const windowHeight = Dimensions.get('window').height; // Get the height of the window

export default function App() {
  // This is a simple Todo List application using React Native
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // useEffect hooks to load and save tasks from/to AsyncStorage
  useEffect(() => {
    loadTasks();
  }, []);

  // This useEffect hook saves tasks to AsyncStorage whenever the tasks state changes
  useEffect(() => {
    saveTasks();
  }, [tasks]);

  // Functions to load and save tasks from/to AsyncStorage
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    } catch (error) {
      console.error('Failed to load tasks.', error);
    }
  };

  // This function saves the tasks to AsyncStorage
  // It is called whenever the tasks state changes
  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks.', error);
    }
  };

  // This function adds or updates a task
  // If editingId is set, it updates the task; otherwise, it adds a new task
  const addOrUpdateTask = () => {
    if (task.trim() === '') return;

    if (editingId) {
      setTasks(tasks.map(t => t.id === editingId ? { ...t, title: task } : t));
      setEditingId(null);
    } else {
      const newTask = { id: Date.now().toString(), title: task, completed: false };
      setTasks([...tasks, newTask]);
    }

    setTask('');
  };

  // This function is used to edit a task
  // It sets the task input to the task's title and sets the editingId to the task's id
  const editTask = (id) => {
    const taskToEdit = tasks.find(t => t.id === id);
    if (taskToEdit) {
      setTask(taskToEdit.title);
      setEditingId(id);
    }
  };

  // This function is used to delete a task
  // It shows an alert to confirm the deletion
  const deleteTask = (id) => {
    Alert.alert('Delete Task', 'Are you sure? You want to delete this task.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          setTasks(tasks.filter(task => task.id !== id));
          if (editingId === id) {
            setEditingId(null);
            setTask('');
          }
        },
      },
    ]);
  };

  // This function toggles the completion status of a task
  // It updates the task's completed status and saves the updated tasks to AsyncStorage
  // It also shows an alert with the updated tasks
  const toggleComplete = (id) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  useEffect(() => { }, [tasks]);


  const renderItem = ({ item }) => (
    <View style={[styles.taskItem, item.completed && styles.completedTask]}>
      {/* The CheckBox component is used to show whether the task is completed or not */}
      <CheckBox
        label={item.title}
        value={item.completed}
        labelStyle={{ textDecorationLine: item.completed ? 'line-through' : null, width: windowWidth*0.5, flex: 1, marginLeft: windowWidth * 0.02, fontSize: windowWidth * 0.04 }} // Adjust the font size based on the window width
        checkboxStyle={{ width: windowWidth * 0.05, height: windowWidth * 0.05 }}
        onChange={() => toggleComplete(item.id)}  // Toggle the task's completion on value change
      />
      <View style={styles.taskActions}>
        <TouchableOpacity onPress={() => editTask(item.id)} style={styles.editButton}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <Text style={styles.title}>Todo List</Text>
      <TextInput
        style={styles.input}
        placeholder="Add or update task"
        value={task}
        onChangeText={setTask}
        maxLength={20}
      />

      <TouchableOpacity onPress={addOrUpdateTask} style={styles.addButton}>
        <Text style={styles.addButtonText}>{editingId ? 'Update Task' : 'Add Task'}</Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  completedTask: {
    backgroundColor: '#d4edda',
  },
  taskText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6c757d',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#ffc107',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },

});
