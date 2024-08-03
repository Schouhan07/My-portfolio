import { Box, Container, VStack, Button, Input, HStack } from "@chakra-ui/react";
import Message from "./Message";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, getAuth, signOut } from "firebase/auth";
import { app } from "./firebase";
import { useEffect, useState, useRef } from "react";
import { getFirestore, addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);

const loginHandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};

const logoutHandler = () => signOut(auth);

function App() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");
  const [TextMsg, setTextMsg] = useState([]);
  const divForScroll = useRef(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setMsg("");
      await addDoc(collection(db, "Message"), {
        text: msg,
        uid: user.uid,
        uri: user.photoURL,
        createdAt: serverTimestamp(),
        deleted: false,
      });
     
      divForScroll.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (data) => {
      setUser(data);
    });

    const q = query(collection(db, "Message"), orderBy("createdAt", "asc"));

    const unsubscribeSnapshot = onSnapshot(q, (snap) => {
      const messages = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTextMsg(messages);
    });

    return () => {
      unsubscribe();
      unsubscribeSnapshot();
    }; // Clean up on unmount
  }, []); // Add the empty dependency array here

  return (
    <Box bg={"red.100"}>
      {user ? (
        <Container h={"100vh"} bg={"white"}>
          <VStack h={"full"} bg={"whatsapp.100"}>
            <Button onClick={logoutHandler} colorScheme={"red"}>Logout</Button>
            <VStack h="full" w="full" overflowY={"auto"}>
              {TextMsg.filter((item) => !item.deleted).map((item)  => (
                <Message
                  key={item.id}
                  user={item.uid === user.uid ? "me" : "other"}
                  text={item.text}
                  uri={item.uri}
                  deleted={item.deleted}
                  onDelete={(deletedId) => setTextMsg((msgs) => msgs.filter((msg) => msg.id !== deletedId))}
                />
              ))}
               <div ref={divForScroll}></div>
            </VStack>
           
            <form onSubmit={submitHandler} style={{ width: "100%" }}>
              <HStack>
                <Input
                  onChange={(e) => setMsg(e.target.value)}
                  type="text"
                  placeholder="Enter your text"
                  value={msg}
                />
                <Button type="submit" colorScheme={"purple"}>Send</Button>
              </HStack>
            </form>
          </VStack>
        </Container>
      ) : (
        <VStack bg={"whitesmoke"} justifyContent={"center"} h={"100vh"}>
          <Button bgColor={"violet"} onClick={loginHandler}>Sign in with Google</Button>
        </VStack>
      )}
    </Box>
  );
}

export default App;
