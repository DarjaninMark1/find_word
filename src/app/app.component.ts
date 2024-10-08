import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgFor, NgIf, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  editInput: boolean = false;

  grid: string[] = [];
  words: string[] = [];
  results: { word: string, direction: string, position: { row: number, col: number }[] }[] = [];
  secretMessage: string = ''; 
  secretMessagePosition: { row: number, col: number }[] = []
  highlightedPositions: { row: number, col: number }[] = [];
  
  inputGrid: string = '';
  inputWords: string = '';

  constructor() { }

  ngOnInit(): void {
    this.grid = [
      'KALTJSHODA',
      'LLPUKLTOAT', 
      'AKTAAKAARR',
      'SAANLAKPEA', 
      'ARPOVPTOKK',
      'RHOMOLICEA', 
      'KOLSPEKESR', 
      'ORAOCAALTP', 
      'SPOKVSTIAA', 
      'MATKAFTKAT', 
      'AIAKOSTKAY',
    ]; 
    this.words = ['ALKA', 'HORA', 'JUTA', 'KAPLE', 'KARPATY', 'KARTA', 'KASA', 'KAVKA',
                  'KLAS', 'KOSMONAUT', 'KOST', 'KROK', 'LAPKA', 'MATKA', 'OKRASA', 'OPAT',
                  'OSMA', 'PAKT', 'PATKA', 'PIETA', 'POCEL', 'POVLAK', 'PROHRA', 'SEKERA',
                  'SHODA', 'SOPKA', 'TAKT', 'TAKTIKA', 'TLAK', 'VOLHA'];
    
    this.searchAllWords();
  }

  // Search all words in the grid
  searchAllWords() {
    this.results = []; 
    this.secretMessage = ''; 
    this.secretMessagePosition = [];
    this.words.forEach(word => {
      let result = this.searchHorizontal(word) || this.searchVertical(word) || 
                   this.searchDiagonalTLBR(word) || this.searchDiagonalTRBL(word);
      if (result) {
        this.results.push(result);
      }
    });
    this.generateSecretMessage(); // Generate the secret message after searching
  }

  // Generate the secret message string
  generateSecretMessage() {
    const foundPositions = new Set<string>();
    this.results.forEach(result => {
      result.position.forEach(pos => {
        foundPositions.add(`${pos.row}-${pos.col}`); // Store positions as strings for easy checking
      });
    });


    // Create secret message by checking if each character in the grid is part of found positions
    this.secretMessage = this.grid.map((row, rowIndex) => {
      return Array.from(row).map((char, colIndex) => {
        // Check if the current character's position is found
        if (!foundPositions.has(`${rowIndex}-${colIndex}`)) {
          this.secretMessagePosition.push({row: rowIndex, col: colIndex});
          return char; // Keep the character if it is not found
        }
        return ''; // Return an empty string for found characters
      }).join(''); // Join characters in the row
    }).join('').trim();
  }

  // Set custom grid and words from user input
  setCustomGrid() {
    const rows = this.inputGrid.split('\n').map(row => row.trim());
    
    // Validate grid to ensure it has between 10 and 20 rows, and each row has the same length
    const gridSize = rows.length;
    const isValidSize = gridSize >= 10 && gridSize <= 20;
    const allRowsValid = rows.every(row => row.length === gridSize);

    if (isValidSize && allRowsValid) {
      this.grid = rows;
      this.words = this.inputWords.split(' ').map(word => word.trim());
      this.searchAllWords();
      this.editInput  = false;
    } else {
      alert('Prosím, zadejte platnou matici (mezi 10x10 a 20x20) se stejnou délkou řádků.');
    }
  }

  // Search word horizontally (left-to-right and right-to-left)
  searchHorizontal(word: string) {
    for (let row = 0; row < this.grid.length; row++) {
      const rowString = this.grid[row];
      let index = rowString.indexOf(word);
      if (index !== -1) {
        return { word, direction: '➡️', position: this.getPositions(row, index, word.length, 'horizontal') };
      }
      // Check reverse
      index = rowString.indexOf(word.split('').reverse().join(''));
      if (index !== -1) {
        return { word, direction: '⬅️', position: this.getPositions(row, index, word.length, 'horizontal-reverse') };
      }
    }
    return null;
  }

  // Search word vertically (top-to-bottom and bottom-to-top)
  searchVertical(word: string) {
    for (let col = 0; col < this.grid[0].length; col++) {
      const colString = this.grid.map(row => row[col]).join('');
      let index = colString.indexOf(word);
      if (index !== -1) {
        return { word, direction: '⬇️', position: this.getPositions(index, col, word.length, 'vertical') };
      }
      // Check reverse
      index = colString.indexOf(word.split('').reverse().join(''));
      if (index !== -1) {
        return { word, direction: '⬆️', position: this.getPositions(index, col, word.length, 'vertical-reverse') };
      }
    }
    return null;
  }

  // Search diagonally (top-left to bottom-right)
  searchDiagonalTLBR(word: string) {
    const size = this.grid.length;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (this.checkDiagonal(word, row, col, 1, 1)) {
          return { word, direction: '↘️', position: this.getPositions(row, col, word.length, 'diagonal-tlbr') };
        }
        if (this.checkDiagonal(word.split('').reverse().join(''), row, col, 1, 1)) {
          return { word, direction: '↖️', position: this.getPositions(row, col, word.length, 'diagonal-tlbr-reverse') };
        }
      }
    }
    return null;
  }

  // Search diagonally (top-right to bottom-left)
  searchDiagonalTRBL(word: string) {
    const size = this.grid.length;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (this.checkDiagonal(word, row, col, 1, -1)) {
          return { word, direction: '↙️', position: this.getPositions(row, col, word.length, 'diagonal-trbl') };
        }
        if (this.checkDiagonal(word.split('').reverse().join(''), row, col, 1, -1)) {
          return { word, direction: '↗️', position: this.getPositions(row, col, word.length, 'diagonal-trbl-reverse') };
        }
      }
    }
    return null;
  }

  // Helper function to check diagonals in any direction
  checkDiagonal(word: string, row: number, col: number, rowInc: number, colInc: number) {
    for (let i = 0; i < word.length; i++) {
      if (!this.grid[row + i * rowInc] || this.grid[row + i * rowInc][col + i * colInc] !== word[i]) {
        return false;
      }
    }
    return true;
  }

  // Helper function to generate positions for found words
  getPositions(row: number, col: number, length: number, direction: string) {
    const positions = [];
    for (let i = 0; i < length; i++) {
      if (direction === 'horizontal') {
        positions.push({ row, col: col + i });
      } else if (direction === 'horizontal-reverse') {
        positions.push({ row, col: col + length - i - 1 });
      } else if (direction === 'vertical') {
        positions.push({ row: row + i, col });
      } else if (direction === 'vertical-reverse') {
        positions.push({ row: row + length - i - 1, col });
      } else if (direction === 'diagonal-tlbr') {
        positions.push({ row: row + i, col: col + i });
      } else if (direction === 'diagonal-tlbr-reverse') {
        positions.push({ row: row + length - i - 1, col: col + length - i - 1 });
      } else if (direction === 'diagonal-trbl') {
        positions.push({ row: row + i, col: col - i });
      } else if (direction === 'diagonal-trbl-reverse') {
        positions.push({ row: row + length - i - 1, col: col - length + i + 1 });
      }
    }
    return positions;
  }

  // Highlight the word when hovering over result
  highlightWord(result:  { row: number, col: number }[] ) {
    this.highlightedPositions = result;
  }

  // Clear highlight when hover ends
  clearHighlight() {
    this.highlightedPositions = [];
  }

  // Check if a grid cell is highlighted
  isHighlighted(row: number, col: number) {
    return this.highlightedPositions.some(pos => pos.row === row && pos.col === col);
  }
}
