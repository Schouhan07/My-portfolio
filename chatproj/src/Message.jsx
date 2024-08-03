import React from 'react';
import { HStack, Avatar, Text, Button, Menu, MenuButton, MenuList, MenuItem,} from "@chakra-ui/react";
import { getFirestore, updateDoc, doc } from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

const Message = ({ id, text, uri, user = "other", deleted, onDelete }) => {
  const handleUnsend = async () => {
    try {
      await updateDoc(doc(db, "Message", id), { deleted: true });
      onDelete(id); // Optional: Update UI state after successful deletion
    } catch (error) {
      alert("Failed to unsend message");
    }
  };

  if (deleted) return null; // Don't render the message if it's marked as deleted

  return (
    <HStack
      alignSelf={user === "me" ? 'flex-end' : 'flex-start'}
      borderRadius={"base"}
      bg="gray.100"
      paddingY={"2"}
      paddingX={user === "me" ? "4" : "2"}
      position="relative"
    >
      {user === "other" && <Avatar src={uri} />}
      <Text>{text}</Text>
      {user === "me" && <Avatar src={uri} />}

      {user === "me" && (
        <Menu>
          <MenuButton as={Button}
            variant="outline"
            size=".25px"
            position="absolute"
            top="0"
            left="1"
            zIndex="1"
            borderRadius="full">
            ...
          </MenuButton>
          <MenuList>
            <MenuItem onClick={handleUnsend}>Unsend</MenuItem>
          </MenuList>
        </Menu>
      )}
    </HStack>
  );
};

export default Message;
