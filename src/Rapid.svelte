<script>
	import { onMount } from 'svelte';
	import dayjs from 'dayjs/esm';
	import 'dayjs/locale/fi' // load on demand
	import 'dayjs/locale/no' // load on demand
	import 'dayjs/locale/en' // load on demand



	import DatePicker from "@beyonk/svelte-datepicker/src/components/DatePicker.svelte";
	
	
	let can_supply_photos = true;

	let languages = [
		{'code': 'en', 'name': 'English'},
		{'code': 'no', 'name': 'Norwegian'},
		{'code': 'fi', 'name': 'Finnish'}
	]
	let language = languages[0];
	$: lang = language.code;

	let brands = [
		{'code': 'no_brand', 'name': 'No Brand', 'color': '#1CD390', 'logo': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAAoCAYAAAB5LPGYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LmRhYmFjYmIsIDIwMjEvMDQvMTQtMDA6Mzk6NDQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMy4wIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZDMDIwMDk4Mzk1RTExRUM4OTg5OUVGQ0FGRjMxMzAzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkZDMDIwMDk5Mzk1RTExRUM4OTg5OUVGQ0FGRjMxMzAzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RkMwMjAwOTYzOTVFMTFFQzg5ODk5RUZDQUZGMzEzMDMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RkMwMjAwOTczOTVFMTFFQzg5ODk5RUZDQUZGMzEzMDMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6Z+wnCAAAGoElEQVR42uxd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'},
		{'code': 'viridor', 'name': 'Viridor', 'color': '#009b3d', 'logo': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAAoCAIAAADYC0ddAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LmRhYmFjYmIsIDIwMjEvMDQvMTQtMDA6Mzk6NDQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMy4wIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZDMDIwMDk0Mzk1RTExRUM4OTg5OUVGQ0FGRjMxMzAzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkZDMDIwMDk1Mzk1RTExRUM4OTg5OUVGQ0FGRjMxMzAzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MzAzN0VDRkYzOENGMTFFQzg5ODk5RUZDQUZGMzEzMDMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MzAzN0VEMDAzOENGMTFFQzg5ODk5RUZDQUZGMzEzMDMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4QhbHhAAAZTUlEQVR42uxcB3hVRfafmVteSfLy0ntCQgihdzGCoQqIgKCI4GJBVkUQXVgLomJZFcW/K6CyNlz/oqIIWFiJShMIJYCEEiAhQHrvecnLu21m596bvITkvRAC37fox/A+SMLMuTNnfnPO75wzN5AQAjrQaLdSR1WtWLe39PiR8jOHS9Jya/IIwUGewYMCe90Y2DsxuL+VtwSZfBmIwPX2p2jwkuBokIWdhUf2lB//6uwPFeVnIO8JGQMgDAA6CDCAmGCBCDZP76iZ8dNGBAwYFzbUizNfV+6fGRwKUbbkJr94/OPsklRJqEVGfwh4RA0DtRi6NQEEAvVbhBAFCAESFipZ1hDi3+/J3vfc320Sj9jrKv4TgiOzNm/Bwbf25ewCsgA5CwSsjob2ZNE/VCAFlWij3fuHD98+7n0Ta7iu5T9oc80PdhUfHbZl1r7zSQiYEedDkUEAbh8ZqiVR0YNVkHAWBH1SLyQtPbz6uor/VJbj/89vnb99ISBGlrMqROq0aE1wfeZffgs1B1xry86oyfnswk8Yg2mRI4b497hyEk1dcEr56S35ydS7zul2W3dLVCeEFNkrPsz8nrJ+I8NrBxeViVV3RY4eG3rD/0RLrTnB11nb5v+6ACBvyBowka/MKEEM8f7Sk9O7jC62V/gaLDzDdXBsgb2sSrCZWN4JXQwwdVpdvSIQhO2PlbFytjaXQ6zm5hqbSKRoz1ATo/q41ac3PLt/GURm+v/vHV7xdMILy/o+CC8ltv328olP3j6wHPI+lIa9m7p6+bBXHu8x43KFFNhLPz67oaauGEBNUdRYw7oAg/WaAEdKWdrcnx8GyIfVkIsJaalfuj2UjVIlYp2PtiEcKj8lzf1ZCCXGK7noGAXHtqLDRQ3lT/ee3cFprT374xt7Hod8GEBNZxpjIpUcnP17X5/Y9sf+WnRw+neTIBvQNJYA2cEZPdJn7TWZDGlV557d9ywAvgxhVe0zgSv2Pd/XGjstakSnlfhzwcH/2/sCZ4zWAIxkwj679+nEoH79fbtflhwza+QIRySENHCwAIrEYWE9//eco6ChYsKWu4hkA0qtLJbSD5bKWnxKERYBYNxRUUhxQ+SWQwShhCjl1GDQDt6c+eW9j+fQM9GxNq/7HcgzDhADgPR8e6ofasz4oHXntrY/kAL6vVMbIB8KkKVxIPACjPGeHvcHm/xoh48zfgAyYBFLHYFCAY8Y2nNzzo5LMip3TVSktWc3Qy4AQEQFKkBmIQsI+3H6j5crCqthILUW9JAp9CMDhRpfmSj/K3CwTlO8MGXFgMhRd4SNoooTVYfSbAMYAHmG33Tu571ZOxiD1SW7wFJdjH/cQ71m8YgRtfVgrMhQeSh2Cv06ufg4cZCp2xYeun0914H4NtDkc0vk2F+zKCPmqDnSAUgU82dnNv1j4DzdJbtsFULN3oJ9lDBBBumopWG2LIjz46frHaocNqp7p/HDlHcwxkJHBeVenfMsIpZLhGrINk1JtawUJKhasP3RCSnr5FPLB8zv7t0ejZoacXN0wR5Fqkes+eJzBgk9MKRm7Yh/3BDQs+3AOsm+PmsLNEWeLf59c/aOu2PGd2RmT/Sa+eu5zYjzUpxHB3F2sXx/6YnRIYPdjUrK24fFWoR89BmqZ5HYgwJ6dbNE6B0mRSZsOvMJAoy6hRCyEAmOkmlhw1FnOaknZ5oeMfLI+Z84YxesRWwIsvShU6ISLjs6uDZDWQPDd7NEZtmKjpSnn6w677JrgNH6zOC/0QDERXpDrhkbN8MlMmj7JntbZUUGy5kANC09/K5DEToys6EBvZHRXyHNnen+EYf9q/O/tGOWv8n+lTo3p5opRSKOsqf6PGBoMjZTu4zpGTRcFvMxkDARRLnA1y9+TvdpV6LEv3a/w8faTRQLqUBMRFnI7xGSMK3LLZcf8uBrERxnqrNv27F44IbbEtcNG/rFwJPVF1z2Xtz7LxbvGKw0XERU6ZI4buUNi1wOKXdUP7H3JWgIpCuHrEdx5amtufs7MjMTa3hmwMPYUc5AxplHgZzlh9xfK4Val0Py6kt25+6EvMVp2OhuIbPfxLDhzj48YpNvX/f4jUsCvUP9PUMeGrTozPStHqzxSpRIiWT6jK1zBy308woJsoY/kbBk/5SvOpEdxtcgOM7V5o9MemB3+kaJknfPOMiFPnFghcvMKVXiR8OWAWxjm1bOUF6tVC4a+Fi0V5jLB7yd9gUR6hjCqaRV41pfZm/tIPu7I2o05E2U5TqxiBhjfcX5lLJTLvvvKDyE7VUs4pu8HaSPTowYE+UV3LKbgeGWD5yfMf27CzO3rBzyt6tSBqJCVt+wOOvuLel3bn59wKMdD9pbgUxSxGsIHNQULzq0oq4qhzGEQ8JhypAZz5Tc7dsLD7kcMDFieHxogihVAW2zZaUOch7UbrvsnF1XuDr1A4C8ZCIRPfvOWX85n1TeUNORycV7R/UPvYmINU4HpsbSvNcXF5LaYpdy6lVnvoRGPxqf6lhSQ3ED89e4210K5xHntEkdb8UNlaers+jnZNW5thCnAqnYS6cHATlbk7ut4PD52vwdhUecQVyQydfmqAKXGTfVSQ27i1MPlZ3Ory89Wp5BpZHOooFOjPqQYxVn6cTohy2wl+08u5UxBKrUTS2kUcUyGLNPprxFIwtDmxPAQPTpzS/f9M14qngCWSKVrx71gTfv4fJhz/3+HqAElvfU0uoqO2EQL9WXZtTmBJisl0YuRHdHjz9WeADo+00ochXIeH2fvqnyhr/7Gb1bAfFcUSrL+WEtHtSdOGS9bwkb2rIbXfwbaevMNAjSOklYsWH7vxKW+GkhN22CIi448Bb9T1aDDn1sZl3e54kvh5j9Fh9enVSwJ6/0FGko7xox8ujUr/XIK7++7KHk18LNgUxjvAOr5dr3E57xM3i30T7YU5z6YcbmlMq0mroye22OySvSxzN4Rpexz/a5n87cbLDUS5UdpKbHKzPfP/PtaVtWdm1hbU2uLFSavCICrVHD/fvNjBk3Mnigy8xvXn3pc6kfmAmvP0XGcpFQ8dWIV82s4amj72288EtV5QWAG7oGDmXPqPQCQi3dpR9HupGI884sSvkma9t9sRPbSu/rG5vYdfKeCz8DyIYFDZodM8Hl1Cmx/f70esD5OY+Cuh+EgUaPI5Vnhgf168j674we8/zhdxRRQZDRt5MBrEyE5NLjt0cmtuz5bdYOwDBqHq6xG5Jh/X3x97XyGlm2go2n/k0cCoWeZl4kAG2vDZrvBIddFr869qEWnjN6nE6k0m9DbypV7B8d/whICmA9IQ9rGmqcFCHPXvrbiVXQEA50U0TDY2JbPvCxVuCQsEx3Zc3JT3BdNeS9IeIgH+AQhCL72ZWFh7bm7loQf483710PKzuSXFmSuuajU1+CBhtWJGSwEGKAhhCHKOYWn/oyZ//69PWJ0ePeHbKoq1d4q7EljopNJ9cSgXIIDTpEBoisCxt2oDT1u5P/hrw/YLwA42GTHOyJqvPQYEIAShcnW5AhYH7ysskRN/sYvNqGJ2sSnu6Tt4eI1R8kPG9w5V8p/Zy3/1X6DDVRAZQWnIsefdP+khML4+/qiFUPNfvfEjni5/Nbacyo5WBVCZQ2rE77ekpkovOACYq0jvaRWfoH6ihHgAi2efF3tuG5RmgKRIjo6ROiZnSsRtScOOEQQuZgdYOBnilBCIY+n7IS4waAzJBTn0kg/SHvjD29qExzDDL46j9Rn04sDGJaeb25e1/cmPY55IIYY1CTS9KKAawJsebM4vS/lTwPGTOEfPs6qZXqxyXNO1m4D0AfxFgQS5oSkRqJZFhk9sAY/3Z6c0L+vm/GrRkVPLCVP6UaUPOvTXkdBnHP7XtNVkRkCm8ZoqOzNTl0dvhiF64dcBNx1K4+/bXL+VH6+Ujf2VHBfUeEDHLZ4Zf8A8fy9yLoReDFCT51Qiinpgh37AYaXfLCnjOJWEsth65PdVMhl1JysMhe7ux2tCIjtzodMIam9VIyZAsL6t+2ANaB2nKrb7FCFPXeirptqolVrSyGjXvhTAJeSs6H6Zs2nljLGMIorpxzoNCgJ4TRsk2QNSLGozE10G7ObcaOxSdydyM2mA5tgjhBmvnXZ6LSAyrZGFJvt0375ZFT1VntTEwFLrXMkKUnmVHT3IwuBxKEKhy12nEkbcIqam08VhxZlVdX6nKWT/We893o1SxycfobZGFxygqgejXcNptKsCJgR8cLoYP9evBe4bJS7yzcIGTA9vKkvH3N9ZSCg7i+EjVNRk1vCDWPxN9t6FTU4AqjVCS1NtSe2DGoo54Iq3a5ozCjJPHpfS9CPkj/YVPKl6JEkJUqWanAxAE1h6jmctqFLyUZe85tYQwhBMiN9kK9lSfTWWFSR22ouq9arEA7INZLqq+4f88yarfaWx3UDCQ9UVggdGmgDkJHrVzLNp1mF8QVIV4Rqpcd++Dfw5e17RBs8qUflw9bk74xr+wk4gJ1HnqFjdq3x3rf+8/k15BHuNLIiujJMHyZtXVO3GSqzWrBtu78Fshbm9MbioA8AqZ3GXV1IjoIFfWaW43Z7HdrzJRIr6DM6hx6ADouYW3GZiLUM0ZvopbmtA3F1I1XxQQPfqTnHRxk12UmHSs6TC0UYYx6CdOlnEJ7+fP7X4F8IGkkiZqTlSutlsh7ek6z8pYfs3alFR3AmKe+u5E+8gGnc3ZszN5BKao726xd1cFArvb2DJ8WN9HKe2XW5gqiwPqrnF8FrOKqwAN5vw1pnz7V+96e1uiOR1YvH/4ndc/uUEoNngEZKCnpeMb61rBhKz39ZIXyCdQ0Me+U7J0F9WURnkHnbfmFxUcYY7iuU1W5WBgYdHOUZ8hVAQedKZCrxsRO/HzEK1be02kBL1WLgU47+s8TnyJTAOUBKh9SJ0n/sr89+o2H4qbpFvThuKkfZ/ywaPfTBPBQdyyu4LE5ezsFGWey6lxYtTW4dumwpU/2nq3byKW97t1demz6rwsb7LUaPjRjxPssP/HJnV1Gu6xq6eYKyxULhzz+0oBHnHUr6kxQnJV6ZRm5iXopnQTQ4/EDb3Y8efdO2peKo5plLNhlOVEr0kV5h6LLqXINCejZ038AkO0taoE8wPKe0qP0641qVtSrEWrqpVbqxMnCnnfDq1GsUA8WcEQE9Pp29BtOZOgg76CErLoC4qhh1Ou3UM+FELHyhYQl87rf6fSt9CkPd5+6ZvRKIpXr4HHF8ZWPMn9ARj8KskYHJFUtu+mF5/rNcXpPOquRQQO+HvMOfQhpBJCCGM/Mgt+L7BUuKzjqAhXbpPjpywc/1rKiqfrRfj6xRLDL2PXeY6AgZDmQu2uHm5xYq5ZfX/rm0fcA40Pn5FJ9akSqNNwY2OeyElA8Yh/oNonyZs2/Nk4MGnzWZ23PsRV/nZkEkZcOX6gSYBEi8/jwhKvjU6j2sG3pgAcNDN85CSeraTxoRmryRfUpCqUXJutDcVPb9pzRZUxgQC9M6ltei3FCvFa0ny85rV3zUI+YjO0m7/AFTdXmlm1M6OAHet8PpAp9LItYyDEZtdnucvZEsj3T54G2Zwn1tMYAikGIXZ4zdX/pySHMY/teo+HiJRXx/NEPiKBGFi6DEag7OEf9DX49LlfF01QCYXDSXzXfipn9OQcf3f96ta2UOLkqXYtS/0CvWZar924EkcRQU+dvOubTqAoyctOhJYqQGJXYNkGgl5MmR46ioVkL09Fs06voz7GspZmJyrjFutsiR1FC5lLPE8NuIorUaO+poUFckaPC3foga/ByJQcFGK1dQgcQIrrjyOpUWK+80qPrL/zSvhZSyzO+Pf05YH0ab2C4EiVjEZmtnbhiScnvhNjxsmxTTY4WPNAmyMLu7N9kzcbrhEMNO6W6ud2mXC1kaNlW1JGD4bbWqihURks3ymjX9N0UZhU1Te0mRLiIixDMIbfWl4WohRD1C8WNc9C8GJZchTOIkpS/xk4hjgqEUHvBDuf32J4XbJLdXQ8aLC05vApglnVvflWqKNaMj57g34HceduxC+JnEKGyMfmgXWGksStiTFrWHzbKl2zRoUN6UXN41eyGhpArYC++RstFw5Fhd95+l1eBREXaWZgCKbMhLcDZ1Lw5Tw1XUDO/BPIeOwpT3AVNu8uOqSG/bnio7cdykJvQ0j1QtcGTIhKh0VNWRHcMjqh77kH39f3T37hTQXJJanLWTyzvp7i/1qYuCcozoyd0jir2tnb1C+wjK/XNnqXpVRpn7EewY2b0JP4qpTeuSutuiSRyg57coPNkkVGpL9uQva1tz+1Fh3OLjiLk2dL0OpdGI8wg3y7qXUSiGgWEPErL0jbn7mor52hFxuqTnyGjry6HGj/qGek0Lp9vAdDNEjE25jYg17iFEA306Zaz1lePrKKU0yXkH0x+BTDe7VxYVwGh1Af69ZoUdXPntBxo8pkdezsRq91hS60ymH3u6ToOXEuth3c0Zc9NKR+o3mvhfZ5Mfun73N3O2z10Dw+Wpc3YthBwVneZJxYxc+OmUttJbbye5KDm/JGdz3x+7qeWNeojFel3bl+MG+oI4dR4GyBZaQjwiw83B7nLkLr1Tfo/bwxaMPj8fyh/gVpZvHXgqj2bhrWKo/zZ39esS3yplZRvsrYVl6ZCLrid7J56eQ40vDZoof5+QOfa1IjEd4/9CysKbOMEtQyj2D9gaIwl7JoCh6/BkhgzZs+FHSxrVfS0JmExZh745bH4oEEzY2/lEfdj9q6DBXspI0OMudEmumqzYsa/fuAVWXGoRTs1l0/lSI9uX/R55tZxanRG9pUcP1R6tNZWAhlPDQbq6wKKWLK0/7JOJIsbwdHDGjO/37z3j6xijCHYnV+Aaupp85n1i3rOGujffOmeEpFFB1+FrDdwE/qrlzAIkuXqHiE33t11/JUoeqB/fJS1Z3b5GQhMrYCohkjAsajPbHit3MVsLqD8vfd9uzM24aaXDLTcg3qv52TxsbSqUypaREGt1zBGoGbo3abXYrzC7u//6Ge/v4/4EIKofFUOxuyB7J0Hi/cDxkCEBu1GvVfTHQkkC1XUWt8be1unwvim9o/BC/x9uypihVpbAm4S6pCn/yw5skrCze7jg/SNDbYinvV2uSKovVRHowwAhe/GrrzCd8sofV7UdxaA9rbZVQVKAJnGhgy5ZkxGszrGhAxO6Ha7IhQz2gspWgEFQ4aljgGKLCOxCBohY4AqMiTYroreGvxEREBfRSynZkOng6oRZT2hbIRqtcdA5TiRgWU7YKTN49aYO3UPsnkeRobfedtnlA5j4nAba1Bmyvnvy0raVXhE/2FefelLB98ErL/k6sVJvYyE1bpm5RfjP47wCLxylU8KTwSEUT0g0EujUK9tEqFqTp97vXnPS0Y9+vsKjdcWtSyXqy1tFq6uo11rpHWFzcIba/0X1Qy+Gvm6yRIiixUM4JwUQY3Aoaz5GkhkBwcVT6MvJKTp0YwWcVz0aA/WuGfyOqslFEsldNVQf5ZakZXVZBVsLCAwiMNSDSA1Gyd/NdCve5stVwOZJg0Ad69MX/TTWEtE0u0bAK7DiqDn91se0KbL/mq1dt7B5SKWNLPxLZAbWMi5unOqXi6j0CBi4Zsj35kWdXXKYH4Gy8S4KUpDDpZqsax+FKlWFiqIYrsrauwlhwtYJHINNbb6WCBV04++lsaYXM0YVtM+egeZqlgulXF7eY4GRSRiMZEah2BK7eXqVtw8yOhzanpSgG+UJORhyUaNqaYxVclEEbFYDhjhx8mfzYmfotRnNj5arKJzq2uTPggy+ZybtW1s92myWIjVqQqNd0j06r0iY9kmiwUWa1jKzJ23hg5tNVwiiro6qUkDcg0Ryxyu7q62rsQkBvX/edrmCVtmYMmOON+2JRWtWmsuKUtddy5pbtwU6sxW/v4OBnLbWjMDWVmuI3LlqyPfXthrxtUy1tSzLOk791R1dpwlGjZnD23dfbvcGNjnksNDzQE3dxlvoky+CSs1cp0313zN0YC4UTGTkFr+bzQAF+ryQ8zt2bwAo0/3mKmRHiGo6bIPlWluk6INNvlm3vXThxnfvX78k1pHCUuQ1FAOWA7yHkNDx68d9lwXz9Cc+uKoyDE9vGM04MASsaKfX1zbJ1I38f3ot1L7P/RS6se78veonkiggFMY3iIjqYtP3xf6z70japTLSpsP750YPcFAON3aUate2FDqb3SReXL9+zkybfmjfppdWZ4NDYGaXYWtiu9EsRtNXjmzdnpyphVp615OXoqYkGZCqgU3WK6CPNowYe3EsARwvbWM/LGcXpN1oCQtzCPQkzN3s4SHmv07zaNpQECDlGqxHmr3PRODBwUarehq/PItt7+8pUEWFh1euS7tU+3WpBdlTPrNncYbmoiRhfI5/ea+d9MS+u3Lxz9dceh1ItAI00jdGaFeiSVDosZuHPmmS0heb3+IdonfCXa6OmvRkVXJF7YShx1SroQoo2YpmcFqKp7BcsmaW1bdHzsZqNeJz71y7JNDZWkY4p7esc/1e/DmoH7wmnvD73q7euDQ29manE25uz8//5+c/MOQoT7SrDFZSLkPwNWP37jkxT5z9asAgiIqBJuv7AWy6+2PBA6nb6uTGg5XnEmtyDhVeaHYXk6pl4/RQhiwuMc9I0MGXtfmn6z9V4ABAFiCMHNWXrIEAAAAAElFTkSuQmCC'},
		{'code': 'metsa', 'name': 'Metsa', 'color': '#8FD300', 'logo': 'data:image/png;base64,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'},
		{'code': 'mercedes', 'name': 'Mercedes Benz', 'color': '#00a19b', 'logo': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAoCAIAAAC5E2UfAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LmRhYmFjYmIsIDIwMjEvMDQvMTQtMDA6Mzk6NDQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMy4wIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZDMDIwMDlDMzk1RTExRUM4OTg5OUVGQ0FGRjMxMzAzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkZDMDIwMDlEMzk1RTExRUM4OTg5OUVGQ0FGRjMxMzAzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RkMwMjAwOUEzOTVFMTFFQzg5ODk5RUZDQUZGMzEzMDMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RkMwMjAwOUIzOTVFMTFFQzg5ODk5RUZDQUZGMzEzMDMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4Q1RylAAAVB0lEQVR42uxa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'}
	]
	let brand = brands[0];
	let single_page = false;
	let photo_modal = false;
	
	
	//form
	let i18n = {
		"en": {
			"util": {
				"back": "Back",
				"next": "Next",
				"submit": "Submit",
				"co": "this",
				"close": "Close"
			},
			"photo": {
				"title": "Take a photo",
				"upload": "Upload",
				"no_photos": "No Photos",
				"modal": {
					"title": "Do you really not have any photos?",
					"body": "Photos and video can be really important to describe an event. They can help in an investigation process and protect you and your organisation...",
					"yes": "Upload",
					"no": "No, I don't"
				}
			},
			"event_location": {
				"title": "Where did it happen?",
				"label": "Site"
			},
			"event_time": {
				"title": "When did it happen?",
				"label": "Date & time"
			},
			"event_type": {
				"title": "What type of incident is it?",
				"label": " ",
				"types": ["Hazard", "Slip trip & fall", "Injury", "Fall from heights", "Other"]

			},
			"event_desc": {
				"title": "What happened?",
				"label": "Incident description"
			},
			"event_correction": {
				"title": "What needs to be done?",
				"label": "Advice to stop this happening again"
			},
			"reporter": {
				"title": "Who is reporting?",
				"label": "Your name or email",
				"hint": "Leave blank to remain anonymous"
			},
			"thanks": {
				"title": "Thanks",
				"body_prefix": "You’ve just submitted a new rapid report. Thanks for helping make",
				"body_suffix": "a safer place!"
			}

		},
		"fi": {
			"util": {
				"back": "Edellinen",
				"next": "Seuraava",
				"submit": "Lähetä",
				"co": "tästä",
				"close": "Kiinni"
			},
			"photo": {
				"title": "Ottaa valokuva",
				"upload": "Lataa",
				"no_photos": "Ei valokuvia",
				"modal": {
					"title": "Eikö sinulla todellakaan ole kuvia?",
					"body": "Valokuvat ja videot voivat olla todella tärkeitä kuvaamaan tapahtumaa. He voivat auttaa tutkintaprosessissa ja suojella sinua ja organisaatiotasi...",
					"yes": "Lataa",
					"no": "Ei, en"
				}
			},
			"event_location": {
				"title": "Missä se tapahtui?",
				"label": "Sivusto"
			},
			"event_time": {
				"title": "Milloin se tapahtui?",
				"label": "Treffiaika"
			},
			"event_type": {
				"title": "Millainen tapaus on kyseessä?",
				"label": " ",
				"types": ["Vaara", "Liukastu, kompastu ja putoaa", "Vahinko", "Putoaa korkeuksista", "Muut"]

			},
			"event_desc": {
				"title": "Mitä tapahtui?",
				"label": "Tapahtuman kuvaus"
			},
			"event_correction": {
				"title": "Mitä pitää tehdä?",
				"label": "Neuvoja, jotta tämä ei toistu"
			},
			"reporter": {
				"title": "Kuka raportoi?",
				"label": "Nimesi tai sähköpostiosoitteesi",
				"hint": "Jätä tyhjäksi pysyäksesi nimettömänä"
			},
			"thanks": {
				"title": "Kiitos",
				"body_prefix": "Olet juuri lähettänyt uuden pikaraportin. Kiitos, että autat tekemään",
				"body_suffix": "turvallisemman paikan!"
			}

		},
		"no": {
			"util": {
				"back": "Tilbake",
				"next": "Neste",
				"submit": "Sende inn",
				"co": "dette",
				"close": "Lukke"
			},
			"photo": {
				"title": "Ta et bilde",
				"upload": "Laste opp",
				"no_photos": "Ingen bilder",
				"modal": {
					"title": "Har du virkelig ingen bilder?",
					"body": "Pbilder og video kan være veldig viktige for å beskrive en hendelse. De kan hjelpe i en etterforskningsprosess og beskytte deg og din organisasjon...",
					"yes": "Laste opp",
					"no": "Nei, det gjør jeg ikke"
				}
			},
			"event_location": {
				"title": "Hvor skjedde det?",
				"label": "Nettstedet"
			},
			"event_time": {
				"title": "Når skjedde det?",
				"label": "Dato tid"
			},
			"event_type": {
				"title": "Hva slags hendelse er det?",
				"label": " ",
				"types": ["Fare", "Skli tur & fall", "Skade", "Fall fra høyder", "Annen"]

			},
			"event_desc": {
				"title": "Hva skjedde?",
				"label": "Hendelsesbeskrivelse"
			},
			"event_correction": {
				"title": "Hva må gjøres?",
				"label": "Råd for å unngå at dette skjer igjen"
			},
			"reporter": {
				"title": "Hvem rapporterer?",
				"label": "Ditt navn eller e-post",
				"hint": "La stå tomt for å være anonym"
			},
			"thanks": {
				"title": "Takk",
				"body_prefix": "Du har nettopp sendt inn en ny hurtigrapport. Takk for at du hjelper til med å gjøre",
				"body_suffix": "til et tryggere sted!"
			}

		}
	}

	let steps = ["photo", "event_location", "event_time", "event_type", "event_desc", "event_correction", "reporter"];
	let current_step = 0;

	let payload = {
		"photo": [],
		"event_location": '',
		"event_time": new Date(),
		"event_type": '',
		"event_desc": '',
		"event_correction": '',
		"event_reporter": ''
	}



	//date time picker
	//let datetime = 'Wed Nov 17 2021 23:10:00 GMT+0200 (Eastern European Standard Time)';   
	let datetime = new Date();


	let drop_region;
	let highlight = false;
	let file_input;
	let reader = new FileReader();
	reader.onload = function(e) {
		payload.photo.push(e.target.result);
		payload.photo = payload.photo;
		setTimeout(() => {
			file_input.value = '';
		}, 100);
	}
	function drop_click() {
		file_input.click();
	} 
	function change_file() {
		let files = file_input.files;
		handle_files(files);
	}
	function drop_file(e) {
		e.preventDefault();
		let files = e.dataTransfer.files;
		handle_files(files);
		unhighlights();
	}
	function highlights() {
		highlight = true;
	}

	function unhighlights() {
		highlight = false;
	}
	function handle_files(files) {
		for (var i = 0, len = files.length; i < len; i++) {
			reader.readAsDataURL(files[i]);
		}
	}



	onMount(() => {
		
		var s = window.location.search; //?photo=1&loc=hi&lang=en&b_name=No%20Brand&b_color=#1CD390&person=John%20Smith
		if(s) {
			
			var search = s.substring(1);
			var params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
			
			if(params.loc) {
				payload.event_location = params.loc;
				steps.splice(steps.indexOf('event_location'),1);
			}
			if(params.lang) {
				let param_lang = languages.filter( (item) => {
					return params.lang == item.code
				})[0];
				if(param_lang) {
					language = param_lang;
					dayjs.locale(language.code);
				}
			}
			if(params.b_code) {
				let param_brand = brands.filter( (item) => {
					return params.b_code == item.code
				})[0];
				if(param_brand) {
					brand = param_brand;
					document.documentElement.style.setProperty('--eo-secondary-500', brand.color);
				}
			}
			if(params.person && params.person !== '') {
				payload.reporter = params.person;
				steps.splice(steps.indexOf('reporter'),1);
			}
			if(params.singlepage && params.singlepage == '1') {
				single_page = true;
			}

			if(params.photo) {
				can_supply_photos = params.photo == '1';
			}
			if(!can_supply_photos) {
				steps.splice(steps.indexOf('photo'),1);
			}

			steps = steps;
			
		}
	});


	let y;
	let pct = 0;

	$: {
		pct = y / (document.body.scrollHeight - document.body.offsetHeight) * 100;
	}
	
</script>

<svelte:window bind:scrollY={y}/>

<div class:single_page>
<pre>
<code>
current_step = {current_step}
can_supply_photos = {can_supply_photos}
brand name = {brand.name}
language = {language.name}
singlepage = {single_page}
payload
{JSON.stringify(payload, null, 4)}

</code>
</pre>
	<div class="header">
		<div class="pane">
			{#if brand.logo !== ''}
				<img src="{brand.logo}" alt="rapid report logo"/>
			{:else}
				<img src="{brands[0].logo}" alt="rapid report logo"/>
			{/if}
		</div>
	</div>
	<div class="pane" style="padding-top: 80px;">
		{#if single_page && current_step < steps.length}
			<div class="progress_wrapper">
				<div class="progress">
					<div class='active' style="width:{pct}%"></div>
				</div>
			</div>
		{/if}
		<!-- STEP PHOTO -->
		{#if steps.indexOf('photo') >= 0 }

			{#if (steps.indexOf('photo') == current_step) || (single_page && current_step < steps.length) }
				<div class="step">
					<h3>{steps.indexOf('photo') + 1} - {i18n[lang]['photo'].title}</h3>
					<div class="progress_steps">
						{#each steps as step, i}
							<div class:active={i <= steps.indexOf('photo')}></div>
						{/each}
					</div>

					<div class="photo_button drop_region" class:highlight="{highlight}" bind:this="{drop_region}"  on:click="{drop_click}" on:drop={drop_file} on:dragenter={highlights} ondragover="return false" on:dragleave={unhighlights} >
						{i18n[lang].photo.upload}
						<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M3 26C2.44772 26 2 25.5523 2 25V8C2 7.44772 2.44772 7 3 7H9.46L11.17 4.45C11.354 4.17061 11.6655 4.00173 12 4H20C20.3345 4.00173 20.646 4.17061 20.83 4.45L22.54 7H29C29.5523 7 30 7.44772 30 8V25C30 25.5523 29.5523 26 29 26H3ZM10 16C10 19.3137 12.6863 22 16 22C19.3137 22 22 19.3137 22 16C22 12.6863 19.3137 10 16 10C12.6863 10 10 12.6863 10 16ZM12 16C12 13.7909 13.7909 12 16 12C18.2091 12 20 13.7909 20 16C20 18.2091 18.2091 20 16 20C13.7909 20 12 18.2091 12 16ZM28 24H4V9H10C10.3345 8.99827 10.646 8.82939 10.83 8.55L12.54 6H19.46L21.17 8.55C21.354 8.82939 21.6655 8.99827 22 9H28V24Z" fill="#1A1919"/>
						</svg>
						<input bind:this="{file_input}" on:change="{change_file}" type="file" accept="image/*" capture="camera">
					</div>


					{#if payload.photo.length == 0}
						<div class="photo_button no_photos" on:click="{ () => { photo_modal = true;}}">
							{i18n[lang].photo.no_photos}
							<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M2 16C2 18.7689 2.82109 21.4757 4.35943 23.778C5.89777 26.0803 8.08427 27.8747 10.6424 28.9343C13.2006 29.9939 16.0155 30.2712 18.7313 29.731C21.447 29.1908 23.9416 27.8574 25.8995 25.8995C27.8574 23.9416 29.1908 21.447 29.731 18.7313C30.2712 16.0155 29.9939 13.2006 28.9343 10.6424C27.8747 8.08427 26.0803 5.89777 23.778 4.35943C21.4757 2.82109 18.7689 2 16 2C12.287 2 8.72601 3.475 6.1005 6.1005C3.475 8.72601 2 12.287 2 16ZM25.15 23.75L8.25 6.85C10.5506 4.935 13.4839 3.94898 16.4742 4.08546C19.4644 4.22195 22.2957 5.47108 24.4123 7.5877C26.5289 9.70432 27.7781 12.5356 27.9145 15.5258C28.051 18.5161 27.065 21.4494 25.15 23.75ZM8.24 25.16C5.81832 23.1035 4.311 20.1706 4.04856 17.0044C3.78612 13.8382 4.78997 10.6972 6.84 8.27L23.73 25.16C21.5642 26.99 18.8204 27.994 15.985 27.994C13.1496 27.994 10.4058 26.99 8.24 25.16Z" fill="#1A1919"/>
							</svg>
								
						</div>
					{:else}
						{#each payload.photo as pic, i}
							<div on:click="{ () => { payload.photo.splice(i,1); payload.photo = payload.photo}}" class="thumbnail" style="background-image: url({pic})"></div>
						{/each}
					{/if}



					<div class="buttons">
						{#if steps.indexOf('photo') !== 0}
							<div class="btn btn-secondary" on:click="{ () => { current_step -= 1; }}">{i18n[lang].util.back}</div>
						{/if}
						{#if payload.photo.length == 0}
							<div class="btn btn-primary disabled">{i18n[lang].util.next}</div>
						{:else}
							<div class="btn btn-primary" on:click="{ () => { current_step += 1; }}">{i18n[lang].util.next}</div>
						{/if}
					</div>
				</div>
			{/if}
		{/if}

		<!-- STEP LOCATION -->
		{#if steps.indexOf('event_location') >= 0 }
			{#if (steps.indexOf('event_location') == current_step) || (single_page && current_step < steps.length) }
				<div class="step">
					<h3>{steps.indexOf('event_location') + 1} - {i18n[lang]['event_location'].title}</h3>
					<div class="progress_steps">
						{#each steps as step, i}
							<div class:active={i <= steps.indexOf('event_location')}></div>
						{/each}
					</div>

					<div class="form-row">
						<label for="event_location">{i18n[lang]['event_location'].label}</label>
						{#if i18n[lang]['event_location'].hint}
							<div class="hint">{i18n[lang]['event_location'].hint}</div>
						{/if}
						<input bind:value={payload.event_location} id="event_location" type="text" class="form-control" autofocus={!single_page}>

					</div>

					<div class="buttons">
						{#if steps.indexOf('event_location') !== 0}
							<div class="btn btn-secondary" on:click="{ () => { current_step -= 1; }}">{i18n[lang].util.back}</div>
						{/if}
						<div class="btn btn-primary" on:click="{ () => { current_step += 1; }}">{i18n[lang].util.next}</div>
					</div>
				</div>
			{/if}
		{/if}

		<!-- STEP WHEN -->
		{#if steps.indexOf('event_time') >= 0 }
			{#if (steps.indexOf('event_time') == current_step) || (single_page && current_step < steps.length) }
				<div class="step">
					<h3>{steps.indexOf('event_time') + 1} - {i18n[lang]['event_time'].title}</h3>
					<div class="progress_steps">
						{#each steps as step, i}
							<div class:active={i <= steps.indexOf('event_time')}></div>
						{/each}
					</div>
					<div class="form-row">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label>{i18n[lang]['event_time'].label}</label>
						<DatePicker
							time={true} 
							format='ddd, DD MMM YYYY HH:mm'
							locale = {lang} 
							bind:selected={payload.event_time}

						>
							<button class="form-control">
								{dayjs(payload.event_time).format('ddd, DD MMM YYYY HH:mm')}
							</button>

						</DatePicker>
					</div>

					<div class="buttons">
						{#if steps.indexOf('event_time') !== 0}
							<div class="btn btn-secondary" on:click="{ () => { current_step -= 1; }}">{i18n[lang].util.back}</div>
						{/if}
						<div class="btn btn-primary" on:click="{ () => { current_step += 1; }}">{i18n[lang].util.next}</div>
					</div>
				</div>
			{/if}
		{/if}

		<!-- STEP TYPE -->
		{#if steps.indexOf('event_type') >= 0 }
			{#if (steps.indexOf('event_type') == current_step) || (single_page && current_step < steps.length) }
				<div class="step">
					<h3>{steps.indexOf('event_type') + 1} - {i18n[lang]['event_type'].title}</h3>
					<div class="progress_steps">
						{#each steps as step, i}
							<div class:active={i <= steps.indexOf('event_type')}></div>
						{/each}
					</div>

					<div>
					{#each i18n[lang].event_type.types as e_type}
						<label class="form-control form-option" class:selected={payload.event_type == e_type}>
							<input type=radio bind:group={payload.event_type} name="scoops" value={e_type}>
							{e_type}
						</label>
					{/each}
					</div>

					<div class="buttons">
						{#if steps.indexOf('event_type') !== 0}
							<div class="btn btn-secondary" on:click="{ () => { current_step -= 1; }}">{i18n[lang].util.back}</div>
						{/if}
						{#if payload.event_type == ''}
							<div class="btn btn-primary disabled">{i18n[lang].util.next}</div>
						{:else}
							<div class="btn btn-primary" on:click="{ () => { current_step += 1; }}">{i18n[lang].util.next}</div>
						{/if}

					</div>
				</div>
			{/if}
		{/if}


		<!-- STEP DESCRIPTION -->
		{#if steps.indexOf('event_desc') >= 0 }
			{#if (steps.indexOf('event_desc') == current_step) || (single_page && current_step < steps.length) }
				<div class="step">
					<h3>{steps.indexOf('event_desc') + 1} - {i18n[lang]['event_desc'].title}</h3>
					<div class="progress_steps">
						{#each steps as step, i}
							<div class:active={i <= steps.indexOf('event_desc')}></div>
						{/each}
					</div>

					<div class="form-row">
						<label for="event_desc">{i18n[lang]['event_desc'].label}</label>
						{#if i18n[lang]['event_desc'].hint}
							<div class="hint">{i18n[lang]['event_desc'].hint}</div>
						{/if}
						<textarea bind:value={payload.event_desc} id="event_desc" class="form-control" autofocus={!single_page} on:keyup={ (e) => { e.target.style.height = (e.target.scrollHeight) + 'px'}}></textarea>

					</div>



					<div class="buttons">
						{#if steps.indexOf('event_desc') !== 0}
							<div class="btn btn-secondary" on:click="{ () => { current_step -= 1; }}">{i18n[lang].util.back}</div>
						{/if}
						<div class="btn btn-primary" on:click="{ () => { current_step += 1; }}">{i18n[lang].util.next}</div>
					</div>
				</div>
			{/if}
		{/if}

		<!-- STEP CORRECTIVE ACTION -->
		{#if steps.indexOf('event_correction') >= 0 }
			{#if (steps.indexOf('event_correction') == current_step) || (single_page && current_step < steps.length) }
				<div class="step">
					<h3>{steps.indexOf('event_correction') + 1} - {i18n[lang]['event_correction'].title}</h3>
					<div class="progress_steps">
						{#each steps as step, i}
							<div class:active={i <= steps.indexOf('event_correction')}></div>
						{/each}
					</div>

					<div class="form-row">
						<label for="event_correction">{i18n[lang]['event_correction'].label}</label>
						{#if i18n[lang]['event_correction'].hint}
							<div class="hint">{i18n[lang]['event_correction'].hint}</div>
						{/if}
						<textarea bind:value={payload.event_correction} id="event_correction" class="form-control" autofocus={!single_page} on:keyup={ (e) => { e.target.style.height = (e.target.scrollHeight) + 'px'}}></textarea>

					</div>


					<div class="buttons" class:keep={(steps[steps.length-1] == 'event_correction' &&  single_page) || (current_step == steps.length-1)}>
						{#if steps.indexOf('reporter') !== 0 && !single_page}
							<div class="btn btn-secondary" on:click="{ () => { current_step -= 1; }}">{i18n[lang].util.back}</div>
						{/if}
						{#if (steps[steps.length-1] == 'event_correction' &&  single_page) || (current_step == steps.length-1)}
							<div class="btn btn-primary" on:click="{ () => { current_step  = steps.length; }}">{i18n[lang].util.submit}</div>
						{:else if (!single_page) }
							<div class="btn btn-primary" on:click="{ () => { current_step += 1; }}">{i18n[lang].util.next}</div>
						{/if}
					</div>
				</div>
			{/if}
		{/if}

		<!-- STEP REPORTER -->
				
		{#if steps.indexOf('reporter') >= 0 }
			{#if (steps.indexOf('reporter') == current_step) || (single_page && current_step < steps.length) }
				<div class="step">
					<h3>{steps.indexOf('reporter') + 1} - {i18n[lang]['reporter'].title}</h3>
					<div class="progress_steps">
						{#each steps as step, i}
							<div class:active={i <= steps.indexOf('reporter')}></div>
						{/each}
					</div>

					<div class="form-row">
						<label for="reporter">{i18n[lang]['reporter'].label}</label>
						{#if i18n[lang]['reporter'].hint}
							<div class="hint">{i18n[lang]['reporter'].hint}</div>
						{/if}
						<input bind:value={payload.reporter} id="event_location" type="text" class="form-control" autofocus={!single_page}>

					</div>


					<div class="buttons" class:keep={(steps[steps.length-1] == 'reporter' &&  single_page) || (current_step == steps.length-1)}>
						{#if steps.indexOf('reporter') !== 0 && !single_page}
							<div class="btn btn-secondary" on:click="{ () => { current_step -= 1; }}">{i18n[lang].util.back}</div>
						{/if}
						{#if (steps[steps.length-1] == 'reporter' &&  single_page) || (current_step == steps.length-1)}
							<div class="btn btn-primary" on:click="{ () => { current_step = steps.length; }}">{i18n[lang].util.submit}</div>
						{:else if (!single_page) }
							<div class="btn btn-primary" on:click="{ () => { current_step += 1; }}">{i18n[lang].util.next}</div>
						{/if}
					</div>
				</div>
			{/if}
		{/if}


		<!-- STEP THANKS -->
		{#if steps.length == current_step}
			<div class="step" style="text-align:center">
				<h3>{i18n[lang]['thanks'].title} {payload.reporter}</h3>
				<svg width="97" height="97" viewBox="0 0 97 97" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path class="brand_fill" d="M42.9258 64.6409L27.9258 49.6379L32.1648 45.3989L42.9258 56.1569L65.6808 33.3989L69.9258 37.6439L42.9258 64.6409Z"/>
					<path class="brand_fill" d="M48.9258 6.39893C40.619 6.39893 32.4987 8.86218 25.5918 13.4772C18.685 18.0922 13.3017 24.6517 10.1229 32.3262C6.94398 40.0007 6.11224 48.4455 7.73282 56.5927C9.3534 64.7399 13.3535 72.2236 19.2273 78.0974C25.1011 83.9712 32.5848 87.9713 40.732 89.5919C48.8792 91.2125 57.324 90.3807 64.9985 87.2019C72.673 84.023 79.2325 78.6397 83.8475 71.7329C88.4625 64.826 90.9258 56.7057 90.9258 48.3989C90.9258 37.2598 86.5008 26.577 78.6243 18.7004C70.7478 10.8239 60.0649 6.39893 48.9258 6.39893ZM48.9258 84.3989C41.8057 84.3989 34.8454 82.2876 28.9253 78.3318C23.0051 74.3761 18.3909 68.7537 15.6661 62.1755C12.9414 55.5974 12.2285 48.359 13.6175 41.3757C15.0066 34.3924 18.4353 27.9778 23.47 22.9431C28.5046 17.9084 34.9192 14.4797 41.9025 13.0907C48.8859 11.7016 56.1243 12.4145 62.7024 15.1393C69.2805 17.864 74.903 22.4782 78.8587 28.3984C82.8144 34.3186 84.9258 41.2788 84.9258 48.3989C84.9258 57.9467 81.1329 67.1035 74.3816 73.8548C67.6303 80.6061 58.4736 84.3989 48.9258 84.3989Z"/>
				</svg>
				<p>{i18n[lang]['thanks'].body_prefix} {(brand.code == 'no_brand' ? i18n[lang].util.co : brand.name)} {i18n[lang]['thanks'].body_suffix}</p>
					
			</div>
		{/if}
	</div>
</div>



{#if photo_modal}
	<div class="modal_bg">
		<div class="modal">
			<h3>{i18n[lang].photo.modal.title}</h3>
			<p>{i18n[lang].photo.modal.body}</p>
			<div class="buttons">
				<div class="btn btn-secondary" on:click="{ () => { photo_modal = false; file_input.click();}}">{i18n[lang].photo.modal.yes}</div>
				<div class="btn btn-danger" on:click="{ () => { photo_modal = false; current_step += 1; }}">{i18n[lang].photo.modal.no}</div>
			</div>
		</div>
	</div>
{/if}

<style>

	.modal_bg {
		position:absolute;
		left:0;
		top:0;
		background-color:rgba(0,0,0,0.5);
		text-align:center;
		width:100%;
		height:100%;
	}
	.modal {
		background:#fff;
		border-radius:12px;
		width:380px;
		box-shadow: 0 4px 16px rgba(0,0,0,0.1);
		position:absolute;
		left: 50%;
		top: 50%;

		min-height: calc(100vh/3);
		padding:32px;
		margin-left: -190px;
		margin-top: -200px;
	}
	.modal .buttons {
		position: relative;
		bottom: auto;
		left: auto;
		margin-top: 48px;
	}
	pre {
		position:absolute;
		left:0;
		top:0;
		width: 300px;
		display:inline-block;
		display:none;
	}
	.header {
		position:fixed;
		width:100%;
		height:64px;
		background:#fff;
		border-bottom:1px solid #E4E5E7;
		z-index:100;
	}
	.header .pane {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		height: 52px;
		padding-top: 12px;
	}
	.pane {
		width:100%;
		max-width:544px;
		margin:0 auto;
		padding:0 32px;
		border-top:1px solid transparent;
	}
	.step {
		height: calc(100vh - 66px);
		position:relative;
		border-top:1px solid transparent;
	}
	.progress_steps {
		display:flex;
		flex-direction:row;
		margin-bottom:32px
	}
	.progress_steps > div {
		height:4px;
		flex: 1;
		border-radius: 2px;
		background: #D6DCE0;
		margin: 4px;
	}
	.progress_steps .active{
		background: var(--eo-secondary-500);
	}

	.progress_wrapper {
		position: fixed;
		top: 0px;
    	width: 480px;
		background-color: var(--eo-surface-background);
		padding-top: 64px;
		z-index:90;

	}
	.progress {
		margin:32px 0;
		background: #D6DCE0;
		border-radius: 2px;
		height:4px;
	}
	.progress > div {
		width:10px;
		height:4px;
		border-radius: 2px;
		background: var(--eo-secondary-500);
	}


	.photo_button {
		padding:32px;
		background:white;
		border-radius:12px;
		margin-bottom:16px;
		line-height:32px;
		cursor:pointer;
		transition: box-shadow 0.5s linear;
	}
	.photo_button:hover {
		box-shadow: 0 4px 16px rgba(0,0,0,0.1)
	}
	.photo_button svg {
		float:right;
	}
	.thumbnail {
		width:114px;
		height:114px;
		border-radius:12px;
		background: #999;
		margin-right:8px;
		margin-bottom:8px;
		display:inline-block;
		background-position: center center;
		background-size: cover;
		cursor:pointer
	}
	.thumbnail:nth-child(4n-1) {
		margin-right:0px;
	}

	.form-row {
		margin: 32px 0;
	}
	.form-row > label {
		display:block;
		font-weight:bold;
	}
	.form-control {
		width: 100%;
		max-width:480px;
		font-size: 20px;
		font-weight: lighter;
		font-family: 'IBM PLEX SANS';
		padding: 11.5px 16px;
		border-radius:12px;
		margin-top:4px;
		background:#fff;
	}
	textarea.form-control {
		min-height: 100px;
		overflow: hidden;

		max-height: calc( 100vh - 300px);
	}
	.hint {
		font-size:14px;
		color:#5C5858;
	}
	.form-option {
		margin-bottom:4px;
		display:block;
		cursor:pointer;
		position:relative;
	}
	.form-option:before {
		display: inline-block;
		content: '';
		background-image: url('../images/components/radio.svg');
		background-size: 20px 20px;
		height: 20px;
		width: 20px;
		position:absolute;
		left:16px;
		top:14px;
	}
	.form-option.selected {
		background: #F5F6FF;
		border-color: var(--eo-primary-500)
	}
	.form-option.selected:before {
		background-image: url('../images/components/radio_selected.svg');
	}


	.buttons {
		position:absolute;
		bottom:32px;
		left:0;
		display:flex;
		flex-direction:row;
		width:100%
	}
	.btn:first-child {
		margin-right:16px;
	}
	.btn:last-child {
		margin-right:0px ! important;
	}
	.btn {
		flex: 1;
		border:1px solid var(--eo-primary-500);
		font-size:21px;
		line-height: 48px;
		padding:0 16px;
		border-radius:24px;
		text-align:center;
		color:var(--eo-primary-500);
		cursor:pointer;
	}
	.btn-primary {
		background:var(--eo-primary-500);
		color:#fff;
	}
	.btn-primary.disabled {
		border-color: #D4D5EA;
		background: #D4D5EA;
		color: #9397CA;
		cursor:no-drop;
	}
	.btn-danger {
		border-color: #E40C0C;
		color: #E40C0C;
	}

	.brand_fill {
		fill: var(--eo-secondary-500);
	}
	.drop_region input {
		position:absolute;
		left:-900px;
	}

	.single_page .buttons:not(.keep), 
	.single_page .progress_steps, 
	.single_page .no_photos {
		display:none
	}
	.single_page .buttons.keep {
		position: relative;
		margin: 96px 0;
		left: auto;
		bottom: 48px;
	}
	.single_page .step {
		height: auto;
	}
	.single_page h3 {
		margin-top:64px;
	}

</style>