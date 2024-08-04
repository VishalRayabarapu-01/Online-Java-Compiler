import java.util.*;
public class Main
{
	public static void main(String[] args) {
		int a;
		System.out.println("Enter the value : ");
	    a=new Scanner(System.in).nextInt();
	    System.out.println("the value is : "+a);
	    int []  arr=new int[a];
	    for(int i=0;i<a;i++){
	        arr[i]=new Scanner(System.in).nextInt();
	    }
	    System.out.println(Arrays.toString(arr));
	}
}