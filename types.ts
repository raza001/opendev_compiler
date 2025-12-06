export enum Language {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  JAVA = 'java',
  CPP = 'cpp',
  GO = 'go',
  RUST = 'rust',
  SQL = 'sql',
  HTML = 'html'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingMetadata?: GroundingMetadata;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: any[];
  webSearchQueries?: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ExecutionResult {
  output: string;
  error?: string;
  status: 'success' | 'error' | 'idle' | 'running';
}

export const LANGUAGE_CONFIG: Record<Language, { name: string; defaultCode: string; icon: string }> = {
  [Language.PYTHON]: {
    name: 'Python 3',
    icon: '🐍',
    defaultCode: `def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Calculate first 10 numbers
for i in range(10):
    print(f"Fib({i}) = {fibonacci(i)}")`
  },
  [Language.JAVASCRIPT]: {
    name: 'JavaScript (Node)',
    icon: '🟨',
    defaultCode: `function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
console.log("System Time:", new Date().toISOString());`
  },
  [Language.TYPESCRIPT]: {
    name: 'TypeScript',
    icon: '📘',
    defaultCode: `interface User {
  id: number;
  name: string;
}

const user: User = {
  id: 1,
  name: "OmniCoder"
};

console.log(\`User \${user.id}: \${user.name}\`);`
  },
  [Language.JAVA]: {
    name: 'Java',
    icon: '☕',
    defaultCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int number : numbers) {
            sum += number;
        }
        System.out.println("Sum: " + sum);
    }
}`
  },
  [Language.CPP]: {
    name: 'C++',
    icon: 'Ⓜ️',
    defaultCode: `#include <iostream>
#include <vector>

int main() {
    std::cout << "Hello from C++!" << std::endl;
    std::vector<int> v = {1, 2, 3};
    
    for(auto i : v) {
        std::cout << i << " ";
    }
    return 0;
}`
  },
  [Language.GO]: {
    name: 'Go',
    icon: '🐹',
    defaultCode: `package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
    
    messages := make(chan string)
    go func() { messages <- "ping" }()
    msg := <-messages
    fmt.Println(msg)
}`
  },
  [Language.RUST]: {
    name: 'Rust',
    icon: '⚙️',
    defaultCode: `fn main() {
    println!("Hello, Rust!");
    
    let numbers = vec![1, 2, 3];
    for n in numbers {
        println!("{}", n);
    }
}`
  },
  [Language.SQL]: {
    name: 'SQL',
    icon: '🗃️',
    defaultCode: `-- SQLite Setup
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER);

-- Insert Data
INSERT INTO users (name) VALUES ('Alice'), ('Bob'), ('Charlie');
INSERT INTO orders (user_id) VALUES (1), (1), (2), (1);

-- Query
SELECT 
    users.name, 
    COUNT(orders.id) as order_count 
FROM users 
LEFT JOIN orders ON users.id = orders.user_id 
GROUP BY users.name;`
  },
  [Language.HTML]: {
    name: 'HTML/CSS',
    icon: '🌐',
    defaultCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { color: blue; }
    </style>
</head>
<body>
    <h1>Hello World</h1>
    <p>This is a preview.</p>
</body>
</html>`
  }
};