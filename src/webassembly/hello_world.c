#include <stdio.h>

long factorial(int num)
{
    if (num <= 0)
        return 1;
    else
    {
        return num * factorial(num - 1);
    }
}

int main()
{
    int num = factorial(10);
    printf("The Result: %d \n", num);
}