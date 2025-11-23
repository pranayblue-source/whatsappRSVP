class Node { // constructor
    constructor(data_name, data_pax)
    {
        this.data_name = data_name;
        this.data_pax = data_pax;
        this.next = null
    }
}
class LinkedList { // linkedlist class
    constructor() {
        this.head = null;
        this.size = 0;
    }

    // adds an element at the end of list
    add(data_name, data_pax) {
        // creates a new node
        var node = new Node(data_name, data_pax);

        // to store current node
        var current;

        // if list is Empty add the
        // element and make it head
        if (this.head == null)
            this.head = node;
        else {
            current = this.head;

            // iterate to the end of the
            // list
            while (current.next) {
                current = current.next;
            }

            // add node
            current.next = node;
        }
        this.size++;
    }

    // removes an element from the specified location
    removeFrom(index) {
        if (index < 0 || index >= this.size)
            return console.log("Please Enter a valid index");
        else {
            var curr, prev, it = 0;
            curr = this.head;
            prev = curr;

            // deleting first element
            if (index === 0) {
                this.head = curr.next;
            } else {
                // iterate over the list to the
                // position to remove an element
                while (it < index) {
                    it++;
                    prev = curr;
                    curr = curr.next;
                }

                // remove the element
                prev.next = curr.next;
            }
            this.size--;

            // return the remove element
            //return curr.data_name;
        }
    }

    // removes a given element from the
    // list
    removeElement(element) {
        var current = this.head;
        var prev = null;

        // iterate over the list
        while (current != null) {
            // comparing element with current element if found then remove the element and return true
            if (current.data_name === element) {
                if (prev == null) {
                    this.head = current.next;
                } else {
                    prev.next = current.next;
                }
                this.size--;
                return current.data_name;
            }
            prev = current;
            current = current.next;
        }
        return -1;
    }


    // finds the index of element
    indexOf(element) {
        var count = 0;
        var current = this.head;

        // iterate over the list
        while (current != null) {
            // compare each element of the list
            // with given element
            if (current.data_name === element)
                return count;
            count++;
            current = current.next;
        }

        // not found
        return -1;
    }

    // checks the list for empty
    isEmpty() {
        return this.size == 0;
    }

    // gives the size of the list
    size_of_list() {
        console.log(this.size);
    }


    // prints the list items
    printList() {
        var curr = this.head;
        var str = "";
        var temp_str = "";
        var total_num = 0;
        while (curr) {
            str += curr.data_name + " - " + curr.data_pax + ",";
            total_num += curr.data_pax;
            curr = curr.next;
        }
        temp_str = str.split(',').join("\r\n") + '\nTotal no. of pax: ' + total_num;
        return temp_str;
    }

}

//Code starts here

const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

function getWord() {
    words = ['shake', 'apple', 'chess', 'house'];
    return words[Math.floor(Math.random() * words.length)];
}

function getResponse(input, word) {
    let output = '⬜⬜⬜⬜⬜';
    let output_l = output.split('');
    let word_l = word.split('');
    let input_l = input.split('');

    for (let i = 0; i < 5; i++) {
        if (word_l[i] === input_l[i]) {
            output_l[i] = '🟩';
            word_l[i] = '#';
            input_l[i] = '*';
        }
    }

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (input_l[i] === word_l[j]) {
                output_l[i] = '🟧';
                input_l[i] = '*';
                word_l[j] = '#';
            }
        }
    }
    return output_l.join('');
}

word = getWord();
chances = 0

var ll = new LinkedList();

client.on('message', async msg => {
    if (msg.body === '!start') { //Intro
        client.sendMessage(msg.from, 'Hi! I’m an RSVP WhatsApp bot. Here are the commands (Please follow the format strictly):\n' +
            '!add NAME NUMBER - add if you are going along with no. of pax\n' +
            '!list - prints the list of attendees\n' +
            '!sendto - Ask someone not in this group.  Format: !sendto 65NUMBER MESSAGE\n' +
            '!wordle - play a game of wordle (5 letter words, 5 chances). Format: !wordle GUESS\n');

    } else if (msg.body.startsWith('!add ')) { //Add or modify attendee
        msg.react('✅');
        let attendee_name = msg.body.slice(5, msg.body.lastIndexOf(" "));
        let attendee_pax = Number(msg.body.slice(msg.body.lastIndexOf(" ")+1));
        if (isNaN(attendee_pax)){msg.reply('Invalid number. Follow the format.');msg.react('❌');}
        else if (attendee_pax === 0){
            if (ll.removeElement(attendee_name) == -1){msg.reply('Unable to find existing name to remove. Type your name exactly.');msg.react('❌');}
            else {msg.reply('Removed ' + attendee_name + ' successfully.');msg.react('✅');}
        }else{
            let temp_add = ll.indexOf(attendee_name);
            if (temp_add === -1){
                ll.add(attendee_name, attendee_pax);
                msg.reply('Added successfully! Welcome, ' + attendee_name + ' 😊');
                msg.react('✅');
            }else{
                var current = ll.head;
                // iterate over the list
                while (current != null) {
                    // compare each element of the list with given element
                    if (current.data_name === attendee_name){
                        current.data_pax = attendee_pax;
                        msg.reply('Changed successfully.');
                        msg.react('✅');
                    }
                    current = current.next;
                }
            }
        }


    } else if (msg.body === '!list') { //Print the list
        msg.react('✅');
        if (ll.isEmpty()){client.sendMessage(msg.from, 'You have no attendees yet 🥲');}
        else{client.sendMessage(msg.from, ll.printList());}

    } else if (msg.body.startsWith('!sendto ')) {
        // Direct send a new message to specific id
        let number = msg.body.split(' ')[1];
        let messageIndex = msg.body.indexOf(number) + number.length;
        let message = msg.body.slice(messageIndex, msg.body.length);
        number = number.includes('@c.us') ? number : `${number}@c.us`;
        let chat = await msg.getChat();
        chat.sendSeen();
        client.sendMessage(number, message);

    } else if (msg.body.startsWith('!wordle ')) {
        msg.react('✅');
        let guess = msg.body.split(' ')[1];
        let response = getResponse(guess, word);
        if (guess.length !== 5) {
            msg.reply('Please enter a 5 letter word');
        } else if (chances === 5) {
            msg.reply('You have no more chances');
        } else {
            response = getResponse(guess, word);
            msg.reply(response);
            chances += 1
        }
    }

    });


client.initialize();