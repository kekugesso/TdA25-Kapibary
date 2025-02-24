import time

start_time = time.time()  # Запоминаем текущее время
time.sleep(5)
end_time = time.time()  # Запоминаем текущее время

elapsed_time = end_time - start_time  # Рассчитываем разницу во времени
print(f"Прошло {int(elapsed_time)} секунд")