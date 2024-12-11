fn count_digits(mut n: u64) -> u32 {
    let mut count = 0;
    if n == 0 {
        return 1;
    }
    while n > 0 {
        n /= 10;
        count += 1;
    }
    count
}
fn split_digits(item:u64, n:u32) -> (u64, u64) {
    let len = n/2;
    let h = 10u64.pow(len);
    let upper = item / h;
    let lower = item - upper*h;
    (upper, lower)
}

// #[inline]
// fn even_digits(item:u64)->bool{
//     count_digits(item)%2==0
// }
#[inline]
fn replace(item:u64)->Vec<u64>{
    
    match (item, count_digits(item)) {
        (0,_)=>vec![1],
        (x,c) if c%2==0=>{
            let x = split_digits(x,  c);
            vec![x.0, x.1]
        },
        (y,_)=>vec![y*2024]
    }
}

fn main() {
    // let input = std::fs::read_to_string("../input.txt")
    //     .expect("no input?")
    //     .trim()
    //     .split(" ")
    //     .map(|item|item.parse().expect("some invalid int"))
    //     .collect::<Vec<u64>>();
    let mut input = vec![125, 17];
    
    
    println!("Input: {input:?}");
    for _ in 0..75 {
        input = input.into_iter().flat_map(replace).collect();
    }
    println!("Output! {:?}", input.len());
}

#[cfg(test)]
mod tests{
    use super::*;
    #[test]
    fn test1(){
        assert!(count_digits(0)==1);
        assert!(count_digits(9)==1);
        assert!(count_digits(10)==2);
        assert!(count_digits(99)==2);
        assert!(count_digits(100)==3);
    }
    // #[test]
    // fn test2(){
    //     assert!(even_digits(0)==false); // NOTE DON'T CARE THIS CASE IS WRONG
    //     assert!(even_digits(1)==false); // NOTE DON'T CARE THIS CASE IS WRONG
    //     assert!(even_digits(5)==false);
    //     assert!(even_digits(9)==false);
    //     assert!(even_digits(10)==true);
    //     assert!(even_digits(99)==true);
    //     assert!(even_digits(100)==false);
    // }

    #[test]
    fn test3(){
        assert_eq!(split_digits(25,2), (2,5));
        assert_eq!(split_digits(2000,4), (20,0));
    }
}