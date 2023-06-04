import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore'; // where 추가 임포트
import {   
  Calendar,
  LocaleConfig,
  DotMarking, } from 'react-native-calendars';

  const firebaseConfig = {
    apiKey: "AIzaSyB38xiZeGztv8VY748sanORRp6sSFZBCYM",
    authDomain: "mobileproject-65860.firebaseapp.com",
    projectId: "mobileproject-65860",
    storageBucket: "mobileproject-65860.appspot.com",
    messagingSenderId: "890013926621",
    appId: "1:890013926621:web:605d7d0786cd42d4024734",
    measurementId: "G-C2Q2ZLCP7Q"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
};

LocaleConfig.defaultLocale = 'ko';
//없어지면 성공
const TodoList = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [isListVisible, setListVisible] = useState(false);
  const [allTasksVisible, setAllTasksVisible] = useState(false);
  const [prevSelectedDate, setPrevSelectedDate] = useState('');
  
  useEffect(() => {
    if (allTasksVisible) {
      setSelectedTasks(tasks);
    } else {
      setSelectedTasks(tasks.filter((task) => task.date === selectedDate));
    }
  }, [tasks, selectedDate, allTasksVisible]);
  

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksData);
    });
  
    return () => unsubscribe();
  }, []);
  

  useEffect(() => {
    const markedDatesData = tasks.reduce((acc, task) => {
      if (task.date) {
        acc[task.date] = {
          ...acc[task.date],
          dots: [{ key: task.id, color: 'green' }],
        };
      }
      return acc;
    }, {});
  
    setMarkedDates(markedDatesData);
  }, [tasks]);
  
  
  
  

  const addTaskToSelectedDate = async () => {
    try {
      if (task !== '' && selectedDate !== '') {
        const docRef = await addDoc(collection(db, 'tasks'), {
          task: task,
          date: selectedDate,
        });
        setTask('');
        setSelectedDate('');
        setModalVisible(false);
        Alert.alert('할 일 추가', '할 일이 추가되었습니다.');
      }
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      Alert.alert('할 일 삭제', '할 일이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setListVisible(true);
  
    const updatedMarkedDates = { ...markedDates };
  
    // 이전에 선택한 날짜의 강조 표시 제거
    Object.keys(updatedMarkedDates).forEach((date) => {
      updatedMarkedDates[date] = { ...updatedMarkedDates[date], selected: false };
    });
  
    // 새로운 선택한 날짜의 강조 표시 설정
    updatedMarkedDates[day.dateString] = {
      ...updatedMarkedDates[day.dateString],
      selected: true,
      marked: true,
      selectedColor: 'blue',
      dotColor: 'white',
    };
  
    setMarkedDates(updatedMarkedDates);
    setSelectedTasks(tasks.filter((task) => task.date === day.dateString));
  };

  const toggleAllTasks = () => {
    setAllTasksVisible(!allTasksVisible);
    if (!allTasksVisible) {
      setSelectedTasks(tasks);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  const renderDay = ({ day, dateString }) => {
    const hasData = markedDates[dateString] !== undefined;
    const textStyle = hasData ? { fontWeight: 'bold' } : {};
  
    return (
      <View style={styles.dayContainer}>
        <Text style={[styles.dayText, textStyle]}>{day}</Text>
      </View>
    );
  };
  
  
  
  
  
  
  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Todo List</Text>
        <TouchableOpacity onPress={toggleAllTasks}>
          <Text style={styles.listButton}>
            {allTasksVisible ? '전체 목록 접기' : '전체 목록 보기'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  

  return (
    <View style={styles.container}>
    {renderHeader()}
    <SafeAreaView>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        renderDay={renderDay}
      />
    </SafeAreaView>
    {isListVisible && (
      <View style={styles.taskList}>
        {selectedTasks.map((task) => (
          <View key={task.id} style={styles.taskItem}>
            <Text style={styles.taskText}>{task.task}</Text>
            <TouchableOpacity onPress={() => deleteTask(task.id)}>
              <Text style={styles.deleteButton}>삭제</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    )}
    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
      <Text style={styles.addButtonText}>날짜에 할 일 추가</Text>
    </TouchableOpacity>
      <Modal animationType="slide" visible={isModalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>할 일 추가</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setTask(text)}
              value={task}
              placeholder="할 일을 입력하세요"
            />
            <TouchableOpacity onPress={addTaskToSelectedDate} style={styles.addButton}>
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeModal} style={styles.closeModalButton}>
              <Text style={styles.closeModalButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {allTasksVisible && (
  <View style={styles.allTasksContainer}>
    <Text style={styles.allTasksTitle}>전체 할 일 목록</Text>
    {selectedTasks.map((task) => (
      <View key={task.id} style={styles.taskItem}>
        <Text style={styles.taskText}>
        날짜 : {task.date} 할 일 : {task.task}
        </Text>
        <TouchableOpacity onPress={() => deleteTask(task.id)}>
          <Text style={styles.deleteButton}>삭제</Text>
        </TouchableOpacity>
      </View>
    ))}
  </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  boldText: {
    fontWeight: 'bold',
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listButton: {
    color: 'blue',
    fontSize: 16,
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  taskList: {
    marginTop: 20,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskText: {
    fontSize: 16,
  },
  deleteButton: {
    color: 'red',
  },
  addButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  closeModalButton: {
    backgroundColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 10,
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  allTasksContainer: {
    marginTop: 20,
  },
  allTasksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginVertical: 1,
  },
  cheaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
});

export default TodoList;
