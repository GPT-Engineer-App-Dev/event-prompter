import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, FormLabel, Heading, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:1337/api";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [promptName, setPromptName] = useState("");
  const [promptText, setPromptText] = useState("");
  const [editingPromptId, setEditingPromptId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchPrompts(token);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchPrompts(data.jwt);
        toast({
          title: "Login Successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchPrompts(data.jwt);
        toast({
          title: "Registration Successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Registration Failed",
          description: "Please try again",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const fetchPrompts = async (token) => {
    try {
      const response = await fetch(`${API_URL}/prompts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPrompts(data.data);
      } else {
        console.error("Failed to fetch prompts");
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
    }
  };

  const handleCreatePrompt = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { name: promptName, prompt: promptText } }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrompts([...prompts, data.data]);
        setPromptName("");
        setPromptText("");
        toast({
          title: "Prompt Created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to Create Prompt",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error creating prompt:", error);
    }
  };

  const handleUpdatePrompt = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/prompts/${editingPromptId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { name: promptName, prompt: promptText } }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedPrompts = prompts.map((prompt) => (prompt.id === editingPromptId ? data.data : prompt));
        setPrompts(updatedPrompts);
        setEditingPromptId(null);
        setPromptName("");
        setPromptText("");
        toast({
          title: "Prompt Updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to Update Prompt",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error updating prompt:", error);
    }
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/prompts/${promptId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedPrompts = prompts.filter((prompt) => prompt.id !== promptId);
        setPrompts(updatedPrompts);
        toast({
          title: "Prompt Deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to Delete Prompt",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting prompt:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setPrompts([]);
  };

  if (!isLoggedIn) {
    return (
      <Box p={4}>
        <Heading mb={4}>{isRegistering ? "Register" : "Login"}</Heading>
        <FormControl id="username" mb={4}>
          <FormLabel>Username</FormLabel>
          <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormControl>
        {isRegistering && (
          <FormControl id="email" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
        )}
        <FormControl id="password" mb={4}>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        <Button colorScheme="blue" onClick={isRegistering ? handleRegister : handleLogin}>
          {isRegistering ? "Register" : "Login"}
        </Button>
        <Text mt={4}>
          {isRegistering ? "Already have an account?" : "Don't have an account?"}
          <Button variant="link" ml={2} onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Login" : "Register"}
          </Button>
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading mb={4}>Prompt Management</Heading>
      <Stack spacing={4}>
        {prompts.map((prompt) => (
          <Box key={prompt.id} p={4} borderWidth={1} borderRadius="md">
            <Heading size="md">{prompt.attributes.name}</Heading>
            <Text>{prompt.attributes.prompt}</Text>
            <Stack direction="row" mt={2}>
              <Button
                leftIcon={<FaEdit />}
                size="sm"
                onClick={() => {
                  setEditingPromptId(prompt.id);
                  setPromptName(prompt.attributes.name);
                  setPromptText(prompt.attributes.prompt);
                }}
              >
                Edit
              </Button>
              <Button leftIcon={<FaTrash />} size="sm" colorScheme="red" onClick={() => handleDeletePrompt(prompt.id)}>
                Delete
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>
      <Box mt={8}>
        <Heading size="md" mb={4}>
          {editingPromptId ? "Edit Prompt" : "Create Prompt"}
        </Heading>
        <FormControl id="promptName" mb={4}>
          <FormLabel>Prompt Name</FormLabel>
          <Input type="text" value={promptName} onChange={(e) => setPromptName(e.target.value)} />
        </FormControl>
        <FormControl id="promptText" mb={4}>
          <FormLabel>Prompt Text</FormLabel>
          <Input type="text" value={promptText} onChange={(e) => setPromptText(e.target.value)} />
        </FormControl>
        <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={editingPromptId ? handleUpdatePrompt : handleCreatePrompt}>
          {editingPromptId ? "Update Prompt" : "Create Prompt"}
        </Button>
      </Box>
      <Button mt={8} onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  );
};

export default Index;
