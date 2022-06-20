#!/usr/bin/env node
"use strict";
import assert from 'assert';
import * as readline from 'node:readline';
import * as util from 'util';

import { stdin as input, stdout as output } from 'node:process';
const rl = readline.createInterface({ input:process.stdin, output:process.stdout });

let remaining_seats = new Set();
let filled_seats = new Map();


function fill_set() {
    for (let i = 1; i <= 4; i++ ) {
        let i_str = i.toString();
        let temp_name = [i_str+"A", i_str+"B", i_str+"C", i_str+"D", i_str+"E", i_str+"F", i_str+"G"];
        for (let j=0; j<7;j++) {
            remaining_seats.add(temp_name[j]);
        }
    }
}

function can_accomodate_1_in_above_layer(curr_layer) {
    let above_layer = curr_layer;
    for ( let layer = curr_layer ; layer > 0; layer-- ) {
        let i_str = layer.toString();
        let temp_name = [i_str+"A", i_str+"B", i_str+"C", i_str+"D", i_str+"E", i_str+"F", i_str+"G"];
        for (let j=0; j<7;j++) {
            if (remaining_seats.has(temp_name[j])) {
                above_layer = layer;
            }
        }
    }
    if (above_layer < curr_layer) {
        return true;
    }
    return false;
}

function can_accomodate_2_in_above_layer(curr_layer) {
    let above_layer = curr_layer;
    for ( let layer = curr_layer ; layer > 0; layer-- ) {
        let i_str = layer.toString();
        let temp_name = [i_str+"A", i_str+"C", i_str+"D", i_str+"F"];
        for (let j=0; j<4;j++) {
            let next = temp_name[j];
            let char = next[1];
            let next_char = String.fromCharCode(next.charCodeAt(1) + 1) ;
            next = next.replace(char, next_char);
            if (remaining_seats.has(temp_name[j]) && remaining_seats.has(next)) {
                above_layer = layer;
            }
        }
    }
    if (above_layer < curr_layer) {
        return true;
    }
    return false;
}

function can_accomodate_3_in_above_layer(curr_layer) {
    let above_layer = curr_layer;
    for ( let layer = curr_layer ; layer > 0; layer-- ) {
        let i_str = layer.toString();
        let temp_name = i_str+"C";
        let next = temp_name;
        next = next.replace("C","D");
        let next_next = temp_name;
        next_next = next_next.replace("C","E");
        if (remaining_seats.has(temp_name) && remaining_seats.has(next) && remaining_seats.has(next_next)) {
            above_layer = layer;
        }
    }
    if (above_layer < curr_layer) {
        return true;
    }
    return false;
}

function check_invariant(curr_layer, number_of_passengers) {
    let remainder = number_of_passengers % 3;
    let rv = false;
    if (remainder == 1) {
        rv  = can_accomodate_1_in_above_layer(curr_layer);
    } else if ( remainder == 2) {
        rv  = can_accomodate_2_in_above_layer(curr_layer);
    } else {
        rv = can_accomodate_3_in_above_layer(curr_layer);
    }
    if (rv === true) {
        return rv;
    }
    number_of_passengers = number_of_passengers - remainder?remainder:3;
    if (number_of_passengers > 0) {
        rv = check_invariant(curr_layer, number_of_passengers);
    }
    return rv;
}


function print_occupancy_table() {
    for (let i = 4; i >= 1; i-- ) {
        let i_str = i.toString();
        let temp_name = [i_str+"A", i_str+"B", i_str+"C", i_str+"D", i_str+"E", i_str+"F", i_str+"G"];
        for (let j=0; j<7;j++) {
            if (filled_seats.has(temp_name[j])) {
                let val = filled_seats.get(temp_name[j]);
                process.stdout.write(val.toString());
            }
            if (remaining_seats.has(temp_name[j])) {
                process.stdout.write('V');
            }
            process.stdout.write('  ');
            if ((j==1)||(j==4)) {
                process.stdout.write('    ');
            }
        }
        if (i===4) {
            process.stdout.write('\n');
        }
        process.stdout.write('\n');
    }
}
function debug_print() {
    // filled_seats.forEach((val, key)=>{
    //     process.stdout.write(key.toString());
    //     process.stdout.write(' ');
    //     process.stdout.write(val.toString());
    //     process.stdout.write('\n');
    // });
    // console.log('\n');
}


function accomodate_1(group_no) {
    debug_print();
    let layer = 0;
    if (remaining_seats.size) {
        let vals = remaining_seats.values();
        let tmp = vals.next().value;
        filled_seats.set(tmp, group_no);
        remaining_seats.delete(tmp);
        layer = tmp.charAt(0);
        layer = parseInt(layer);
        debug_print();
        return layer;
    }
    debug_print();
    return layer;
}

function accomodate_2(group_no) {
    if (remaining_seats.size<2) {
        debug_print();
        return false;
    } 
    let prev_size = remaining_seats.size;
    let vals = remaining_seats.values();
    let x = vals.next().value;
    
    debug_print();
    let layer = 0;
    for (let c = x.charAt(0); c <'5'; c++ ) {
        let first = c;
        let candidates = [first + "A", first + "C", first + "D", first + "F"];
        
        candidates.every((y) => {
            let next = y;
            let char = y[1];
            let next_char = String.fromCharCode(y.charCodeAt(1) + 1) ;
            next = next.replace(char, next_char);
            if (remaining_seats.has(y) && remaining_seats.has(next)) {
                filled_seats.set(y, group_no);
                filled_seats.set(next, group_no);
                remaining_seats.delete(y);
                remaining_seats.delete(next);
                layer = y.charAt(0);
                layer = parseInt(layer);
                return false;
            }
            return true;
        });
        if (prev_size != remaining_seats.size) {
            break;
        }
    }
    debug_print();
    
    if (prev_size == remaining_seats.size) {
        layer = accomodate_1(group_no);
        accomodate_1(group_no);
    }
    debug_print();
    return layer;
}


function accomodate_3(group_no) {
    if (remaining_seats.size<3) {
        debug_print();
        return false;
    } 
    let prev_size = remaining_seats.size;
    let vals = remaining_seats.values();
    let x = vals.next().value;
    debug_print();
    let layer = 0;
    for (let c = x.charAt(0); c <'5'; c++ ) {
        let first = c;
        let candidate = first + "C";
        let next = first + "D";
        let next_next = first + "E";
        if (remaining_seats.has(candidate) && remaining_seats.has(next) && remaining_seats.has(next_next)) {

            filled_seats.set(candidate, group_no);
            filled_seats.set(next, group_no);
            filled_seats.set(next_next, group_no);

            remaining_seats.delete(candidate);
            remaining_seats.delete(next);
            remaining_seats.delete(next_next);

            layer = candidate.charAt(0);
            layer = parseInt(layer);
            break;
        } 
    }
    if (prev_size == remaining_seats.size) {
        layer = accomodate_1(group_no);
        accomodate_2(group_no);
    }
    debug_print();
    return layer;
}

function accomodate_general(numbers_in_group, group_no) {
     if (numbers_in_group > remaining_seats.size) {
         return false;
     }
     let total_accomdation = numbers_in_group;
     let remainder = total_accomdation%3;
     let layer = 0;
     while (total_accomdation > 0) {
        if (remainder == 1) {
            layer = accomodate_1(group_no);
        } else if (remainder == 2) {
            layer = accomodate_2(group_no);
        } else {
            layer = accomodate_3(group_no);
        }
        total_accomdation = (total_accomdation > 0)?(remainder==0)?total_accomdation-3:total_accomdation-remainder:total_accomdation;
        let rv = check_invariant(layer, remainder);
        assert(rv == false);
        remainder = total_accomdation%3;
     }
     return true;
}

function run(numbers_in_group, group_no) {
    if (numbers_in_group > remaining_seats.size) {
        console.log("Sorry! can't accomodate ", numbers_in_group, " more passengers");
        return;
    }
    accomodate_general(numbers_in_group, group_no);
    
    print_occupancy_table();
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const run_tests =  async() =>  {
  let run_no = 0;
  while (true) {
    console.log("------------test run number------------ ", run_no);
    let numbers = [];

    for (let i = 1; i <= 6; i++) {
        numbers.push(Math.floor(Math.random() * 10) + 1);
    }
    fill_set();
    let group_no = 0;
    
    numbers.map((numbers_in_group) => {
            console.log("assigning for ", numbers_in_group, " passengers");
            rl.close();
            group_no++;
            if (!remaining_seats.size) {
                return;
            }
            run(numbers_in_group, group_no);
        }
    )
    run_no++;
    remaining_seats.clear();
    filled_seats.clear();
    await sleep(3000);
  }  
}


const run_with_user_input =  async() => {
    fill_set();
    let group_no = 0;
    while (true) {
        let numbers_in_group;
        const question = util.promisify(rl.question).bind(rl);
        try {
            const answer = await question('What is the number of passenger to accomodate? ');
            console.log(`Accomodating ${answer} passengers`);
            numbers_in_group = answer;
          } catch (err) {
            console.error('Question rejected', err);
        }
        group_no++;
        if (remaining_seats.size == 0) {
            remaining_seats.clear();
            filled_seats.clear();
            return;
        }
        run(numbers_in_group, group_no);
    }
}

const main =  async() => {
        run_with_user_input();
        //run_tests();
};   

main();