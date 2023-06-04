import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import firebase from 'firebase/app';
import 'firebase/firestore';

const List = () => {
  const [isListModalVisible, setListModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Firebase 초기화
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const snapshot = await firebase.firestore().collection('tasks').get();
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  const renderTaskItem = (task) => (
    <View style={styles.taskItem} key={task.id}>
      <Text>{task.task}</Text>
      <TouchableOpacity onPress={() => removeTask(task.id)}>
        <Text style={styles.removeButton}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const toggleListModal = () => {
    setListModalVisible(!isListModalVisible);
  };

  const removeTask = async (taskId) => {
    try {
      await firebase.firestore().collection('tasks').doc(taskId).delete();
      fetchTasks();
    } catch (error) {
      console.error('Error removing task: ', error);
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.listButton} onPress={toggleListModal}>
        <Text style={styles.listButtonLabel}>List</Text>
      </TouchableOpacity>
      <Modal isVisible={isListModalVisible}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={toggleListModal}>
            <Text style={styles.closeButtonLabel}>Close</Text>
          </TouchableOpacity>
          {tasks.length > 0 ? (
            tasks.map(renderTaskItem)
          ) : (
            <Text style={styles.noTaskText}>No tasks available.</Text>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  listButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
  },
  listButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  closeButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  removeButton: {
    color: 'red',
    fontWeight: 'bold',
  },
  noTaskText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
  },
});

export default List;
